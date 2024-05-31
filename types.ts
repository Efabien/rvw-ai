export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface RequestBody {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}