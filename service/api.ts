import fs from "node:fs";
import { logErrorMessage, logInfoMessage, logSuccessMessage } from "./log.js";
import kleur from "kleur";
import dotenv from "dotenv";

dotenv.config();

const API_URL = process.env.AOC_API ?? "https://adventofcode.com";

const apiRoutes = {
  getInput: (day: number, year: number) => {
    return `${API_URL}/${year}/day/${day}/input`;
  },
};

export async function getInput(year: number, day: number, path: string) {
  if (fs.existsSync(path) && fs.statSync(path).size > 0) {
    return;
  }

  fetch(apiRoutes.getInput(day, year), {
    headers: {
      cookie: `session=${process.env.AOC_SESSION_KEY}`,
    },
  })
    .then((res) => {
      if (res.status !== 200) {
        throw new Error(String(res.status));
      }

      return res.text();
    })
    .then((body) => {
      fs.writeFileSync(path, body.replace(/\n$/, ""));
      logSuccessMessage(`Input for day ${day} saved!`);
    })
    .catch(handleErrors);
}

function handleErrors(e: Error) {
  if (e.message === "400" || e.message === "500") {
    logErrorMessage("INVALID SESSION KEY\n");
    logInfoMessage(
      "Please make sure that the session key in the .env file is correct.\n" +
        "You can find your session key in the 'session' cookie at: https://adventofcode.com\n\n"
    );
  } else if (e.message.startsWith("5")) {
    logErrorMessage("Server error\n\n");
  } else if (e.message === "404") {
    logErrorMessage("Challenge not found \n\n");
  } else {
    logErrorMessage(
      "UNEXPECTED ERROR\nPlease check your internet connection.\n\nIf you think it's a bug, contact organizers"
    );

    console.log(e);
  }

  return;
}
