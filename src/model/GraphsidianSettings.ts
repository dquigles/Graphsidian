import { GraphsidianCommand } from "./GraphsidianCommand";

export interface GraphsidianSettings {
  ollamaUrl: string;
  defaultModel: string;
  commands: GraphsidianCommand[];
}