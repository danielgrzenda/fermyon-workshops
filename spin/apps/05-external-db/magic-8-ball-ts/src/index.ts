import { HandleRequest, HttpRequest, HttpResponse} from "@fermyon/spin-sdk"

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export const handleRequest: HandleRequest = async function(request: HttpRequest): Promise<HttpResponse> {
    let question = decoder.decode(request.body);
    let answerJson = `{\"answer\": \"${getOrSetAnswer(question)}\"}`;
    return {
      status: 200,
        headers: { "Content-Type": "application/json" },
      body: encoder.encode(answerJson).buffer
    }
}

function getOrSetAnswer(question: string): string {
  let address = process.env["REDIS_ADDRESS"] as string;
  let store = spinSdk.kv.openDefault();
  let response = decoder.decode(spinSdk.redis.get(address, question));
  if ( response.length == 0 || response == "Ask again later." ) {
    response = answer();
    store.set(question, response);
  }
  return response;
}

function answer(): string {
  let rand = Math.random();
  if ( rand < 0.25 ) {
    return "Ask again later."
  } else if ( rand < 0.50 ) {
    return "Absolutely!"
  } else if ( rand < 0.75 ) {
    return "Unlikely"
  } else {
    return "Simply put, no."
  }
}