import { Spectrum } from "spectrum-ts";
import { imessage } from "spectrum-ts/providers/imessage";

const app = await Spectrum({
  projectId: "0c8bfd35-90d9-4413-a24d-0f44aa955d1a",
  projectSecret: "l5Bt-Ul7KHbSmkWQJOF7ygy4ggsXs0g8go6cjvqPaAw",
  providers: [
    imessage.config(),
  ],
});

for await (const [space, message] of app.messages) {
  if (message.content.type === "text") {
    console.log(`[${message.platform}] ${message.sender.id}: ${message.content.text}`);
    await space.send("hello world");
  }
}