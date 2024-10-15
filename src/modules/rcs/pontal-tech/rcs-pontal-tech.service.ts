import { Nack } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { RcsMessageModel } from '@/models/rsc-message.model';
import { PontalTechRcsIntegrationService } from '@/modules/brokers/pontal-tech/pontal-tech-rcs-integration.service';
import { PontalTechRcsApiRequestMapper } from '@/modules/brokers/pontal-tech/pontal-tech-rcs.models';
import { BrokerType } from '@/modules/database/channels-gateway/entities/enums';
import {
  MessageDirection,
  MessageStatus,
} from '@/modules/database/rcs/entities/enums';
import { RcsAccountService } from '@/modules/entity-manager/rcs/services/rcs-account.service';
import { RcsMessageService } from '@/modules/message/services/rcs-message.service';

@Injectable()
export class RcsPontalTechService {
  constructor(
    private readonly pontalTechRcsIntegrationService: PontalTechRcsIntegrationService,
    private readonly messageService: RcsMessageService,
    private readonly rcsAccountService: RcsAccountService,
  ) {}

  private readonly logger = new Logger(RcsPontalTechService.name);

  public async sendMessage(channelConfigId: string, message: RcsMessageModel) {
    try {
      const account = await this.rcsAccountService.getByReference(
        channelConfigId,
        BrokerType.PONTAL_TECH,
      );

      if (!account?.pontalTechRcsAccount?.pontalTechAccountId) {
        throw new Error('Account not found');
      }

      const model = PontalTechRcsApiRequestMapper.fromMessageModel(
        account.pontalTechRcsAccount.pontalTechAccountId,
        message,
      );

      this.logger.debug(model, 'sendMessage :: OUTBOUND :: Message received');

      if (message.type === 'basic') {
        const data = await lastValueFrom(
          this.pontalTechRcsIntegrationService.sendRcsBasicMessage(model),
        );

        this.logger.debug(data, 'sendMessage :: data');

        await Promise.allSettled(
          data.messages.map((dataMessage) =>
            this.messageService
              .outboundMessage(
                channelConfigId,
                dataMessage.id,
                MessageDirection.OUTBOUND,
                MessageStatus.QUEUED,
                message.content,
                {
                  id: message.chatId,
                  brokerChatId: dataMessage.session_id,
                  rcsAccountId: account.pontalTechRcsAccount.rcsAccountId,
                },
              )
              .then((message) =>
                this.logger.debug(message, 'sendMessage :: Message saved'),
              )
              .catch((error) => {
                this.logger.error(error, 'sendMessage :: Error saving message');
              }),
          ),
        );

        return;
      }

      if (message.type === 'standard') {
        const data = await lastValueFrom(
          this.pontalTechRcsIntegrationService.sendRcsSingleMessage(model),
        );

        this.logger.log(data, 'rcsPontalTechHandler :: data');

        return;
      }

      this.logger.warn(
        message,
        'rcsPontalTechHandler :: Message type not supported',
      );
    } catch (error) {
      this.logger.error(error, 'rcsPontalTechHandler');
      this.logger.debug(message, 'rcsPontalTechHandler :: error :: message');

      return new Nack(false);
    }
  }
}
