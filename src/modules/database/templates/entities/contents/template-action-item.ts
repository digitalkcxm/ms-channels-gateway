export type TemplateActionItemType = 'openUrl' | 'call' | 'reply';

export class TemplateActionItem {
  type: TemplateActionItemType;
  text: string;
  value: string;
}
