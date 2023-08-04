import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


export type GenerateResponseData = {
  original: string | null;
  generated: string | null;
  id: string;
};


export default async function (req: any, res: any) {
  console.log('=====================================================================================================');
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  // const emailText = req.body.emailText || '';
  // if (emailText.trim().length === 0) {
  //   res.status(400).json({
  //     error: {
  //       message: "이메일 내용을 입력하세요.",
  //     }
  //   });
  //   return;
  // }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: generatePrompt2(req.body) },
        { role: "user", content: generatePrompt(req.body) },
        // { role: "user", content: generatePrompt2(req.body) },
      ],
      //max_tokens: 3000,
      // temperature: 0.6,
    });
    res
      .status(200)
      .json({ result: completion.data.choices[0].message?.content });
  } catch (error: any) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function generatePrompt(body: any ) {
  // let promptText = `Please make in high quality English based on the following information.\n`
  let promptText = '';
  if (body.myCompanyText) {
    promptText += `Sender's Company: ${body.myCompanyText}\n`;
  }
  if (body.myNameText) {
    promptText += `Sender's Name: ${body.myNameText}\n`;
  }
  if (body.reCompanyText) {
    promptText += `Receiver's Company: ${body.reCompanyText}\n`;
  }
  if (body.reNameText) {
    promptText += `Receiver's Name: ${body.reNameText}\n`;
  }
  if (body.emailBodyText) {
    promptText += `${body.emailBodyText}\n`;
  }
  // purpose: ${body.purposeText},
  // questions: ${body.questionText}`;
  console.log(promptText);
  return promptText;

  //   const capitalizedAnimal =
  //     animal[0].toUpperCase() + animal.slice(1).toLowerCase();

  //   return `Suggest three names for an animal that is a superhero.

  // Animal: Cat
  // Names: Captain Sharpclaw, Agent Fluffball, The Incredible Feline
  // Animal: Dog
  // Names: Ruff the Protector, Wonder Canine, Sir Barks-a-Lot
  // Animal: ${capitalizedAnimal}
  // Names:`;
}

function generatePrompt2(body: any) {
  let promptText = `Please make an English email.`;
  if(!body.introText) {
    promptText += ` But, please Do NOT introduce yourself.`;
  }

  console.log(promptText);
  return promptText;

}
