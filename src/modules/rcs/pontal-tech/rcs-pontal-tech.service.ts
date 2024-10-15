import { Nack } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { BrokerType, MessageDirection, MessageStatus } from '@/models/enums';
import { RcsAccountNotFoundException } from '@/models/exceptions/rcs-account-not-found.exception';
import { RcsMessageModel } from '@/models/rsc-message.model';
import { PontalTechRcsIntegrationService } from '@/modules/brokers/pontal-tech/pontal-tech-rcs-integration.service';
import { PontalTechRcsApiRequestMapper } from '@/modules/brokers/pontal-tech/pontal-tech-rcs.models';
import { RcsAccountService } from '@/modules/entity-manager/rcs/services/rcs-account.service';
import { RcsMessageService } from '@/modules/message/services/rcs-message.service';

@Injectable()
export class RcsPontalTechService {
  constructor(
    private readonly pontalTechRcsIntegrationService: PontalTechRcsIntegrationService,
    private readonly rcsMessageService: RcsMessageService,
    private readonly rcsAccountService: RcsAccountService,
  ) {}

  private readonly logger = new Logger(RcsPontalTechService.name);

  public async sendMessage(message: RcsMessageModel) {
    try {
      const { channelConfigId } = message;

      const account = await this.rcsAccountService.getByReference(
        channelConfigId,
        BrokerType.PONTAL_TECH,
      );

      if (!account?.pontalTechRcsAccount?.pontalTechAccountId) {
        throw new RcsAccountNotFoundException(
          channelConfigId,
          BrokerType.PONTAL_TECH,
        );
      }

      const [type, model] = PontalTechRcsApiRequestMapper.fromMessageModel(
        account.pontalTechRcsAccount.pontalTechAccountId,
        message,
      );

      this.logger.debug(model, 'sendMessage :: OUTBOUND :: Message received');

      //TODO
      //validaçao se o usuario pode ou nao enviar o tipo de mensagem com a conta atual

      try {
        if (type === 'basic') {
          const data = await lastValueFrom(
            this.pontalTechRcsIntegrationService.sendRcsBasicMessage(model),
          );

          this.logger.debug(data, 'sendMessage :: data');
          await Promise.all(
            data.messages.map((dataMessage) =>
              this.rcsMessageService.outboundMessage(
                channelConfigId,
                MessageDirection.OUTBOUND,
                MessageStatus.QUEUED,
                message,
                {
                  id: message.chatId,
                  brokerChatId: dataMessage.session_id,
                  rcsAccountId: account.pontalTechRcsAccount.rcsAccountId,
                },
                dataMessage.id,
              ),
            ),
          );

          return;
        }

        if (type === 'standard') {
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
        await this.rcsMessageService.outboundMessage(
          channelConfigId,
          MessageDirection.OUTBOUND,
          MessageStatus.ERROR,
          message,
          {
            id: message.chatId,
            rcsAccountId: account.pontalTechRcsAccount.rcsAccountId,
          },
          undefined,
          error.message,
        );
      }
    } catch (error) {
      this.logger.error(error, 'rcsPontalTechHandler');
      this.logger.debug(message, 'rcsPontalTechHandler :: error :: message');

      return new Nack(false);
    }
  }
}
