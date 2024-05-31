import { RequestBody } from "./types.ts";
import { join }from "https://deno.land/std@0.224.0/path/mod.ts";

const run = async () => {
  try {
    const [filePath] = Deno.args;
    const requestBody = await buidldRequestBody(filePath);
    console.log(requestBody);
    const response = await call(requestBody);
    readResponse(response);
    
  } catch (error) {
    console.error(error);
  }
}

const call = async (requestBody: RequestBody): Promise<Response> => {
  const response = await fetch("http://localhost:1234/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: new TextEncoder().encode(JSON.stringify(requestBody))
  });
  if (!response.ok) throw Error(`Error: ${response.status} ${response.statusText}`);
  return response;
}

const readResponse = async(response: Response) => {
  const reader = response.body?.getReader();
  if (!reader) throw Error("Failed to read response body");
  let output = ''
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const partialText = new TextDecoder().decode(value);
    output += (partialText || '').trim().split('\n')
      .filter(item => !!item)
      .reduce(
        (content, item) => {
          if (item === 'data: [DONE]') {
            return content;
          }
          const { choices: [elemet] } = JSON.parse(item.replace('data: ', ''))

          return content += elemet.delta.content || '';
        },
        ''
      );
     console.clear();
     console.log(output)
  }
}

const loadFileContent = async (filePath: string): Promise<string> => {
  return Deno.readTextFile(filePath);
}

const buidldRequestBody = async (filePath: string): Promise<RequestBody> => {
  const requestBody: RequestBody = {
    model: "model-identifier",
    messages: [
      { role: "system", content: "You are a seasoned senior software engineer, your role is to perform code reviews. Organize your response with bullet points by order of priority" },
      { role: "user", content: "Given the following code, do a code review of the code" },
    ],
    temperature: 0.7,
    max_tokens: -1,
    stream: true,
  };
  const fileContent = await loadFileContent(join(Deno.cwd(), filePath));
  requestBody.messages[1].content += ` the code : ${fileContent}`
  return requestBody;
}

run();
