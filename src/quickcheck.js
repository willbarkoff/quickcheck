import Listr from "listr"
import playwright from "playwright-firefox"
import fs from 'fs'
import untildify from 'untildify'
import { defaultSettings } from "./configure";

export default async function quickcheck() {
	let browser;
	let page;
	let context;
	let config;

	const listr = new Listr([
		{
			title: "Loading configuration",
			task: async (ctx, task) => {
				config = JSON.parse(fs.readFileSync(untildify("~/.quickcheck.json"), { encoding: "utf8" }))
				if (!config.affirmationTime) {
					throw new Error("You must accept the terms and conditions prior to using Quick Check. Run quickcheck --config to do so.")
				}
				if (!config.settings) {
					config.settings = defaultSettings;
				}
			},
		},
		{
			title: "Launching browser",
			task: async (ctx, task) => {
				browser = await playwright['firefox'].launch({ headless: config.settings.headless });
				context = await browser.newContext();
			},
		},
		{
			title: "Navigating to Daily Check",
			task: async (ctx, task) => {
				page = await context.newPage()
				await page.goto('https://dailycheck.cornell.edu/saml_login_user?redirect=%2Fdaily-checkin');
			}
		},
		{
			title: "Logging in",
			task: async (ctx, task) => {
				await page.fill("#netid", config.login.netID);
				await page.fill("#password", config.login.password);
				await page.click(".input-submit");
				try {
					await page.waitForNavigation({
						url: "https://dailycheck.cornell.edu/daily-checkin",
						timeout: 3000
					})
				} catch {
					task.report(new Error("Something went wrong logging in. Check to make sure your credentials are correct."))
				}
			}
		},
		{
			title: "Completing Daily Check",
			task: async (ctx, task) => {
				try {
					await page.click("#continue", { timeout: config.settings.timeout });
				} catch {
					throw new Error("It looks like you already completed the Daily Check");
				}
				await page.click(config.dailyCheck.positivetestever ? "#positivetestever-yes" : "#positivetestever-no")
				if (config.dailyCheck.positivetestever) {
					await page.click(`#${config.dailyCheck.positivetest}`)
				}

				await page.click(config.dailyCheck.covidsymptoms ? "#covidsymptoms-yes" : "#covidsymptoms-no")
				if (config.dailyCheck.covidsymptoms) {
					await page.click(config.dailyCheck.telemedvisit ? "#telemedvisit-yes" : "#telemedvisit-no")
					if (config.dailyCheck.telemedvisit) {
						await page.click(config.dailyCheck.symptomsworsened ? "#symptomsworsened-yes" : "#symptomsworsened-no")
						if (!config.dailyCheck.symptomsworsened) {
							await page.click(config.dailyCheck.cleared ? "#cleared-yes" : "#cleared-no")
						}
					}
				}

				await page.click(config.dailyCheck.contactdiagnosed ? "#contactdiagnosed-yes" : "#contactdiagnosed-no")
				await page.click(config.dailyCheck.contactsymptoms ? "#contactsymptoms-yes" : "#contactsymptoms-no")

				if (config.dailyCheck.contactdiagnosed || config.dailyCheck.contactsymptoms) {
					await page.click(config.dailyCheck.contacttelemedvisit ? "#contacttelemedvisit-yes" : "#contacttelemedvisit-no")
					if (config.dailyCheck.contacttelemedvisit) {
						await page.click(config.dailyCheck.clearedcontact ? "#clearedcontact-yes" : "#clearedcontact-no")
					}
				}
			}
		},
		{
			title: "Submitting Daily Check",
			task: async (ctx, task) => {
				await sleep(config.settings.timeout)
				await page.click("#submit")
				await page.click("#submit")
			}
		},
		{
			title: "Taking screenshot",
			task: async (ctx, task) => {
				await page.waitForSelector(".messages.messages--status.mask_message")
				await page.screenshot({ path: `dailycheck-today.png` })
				task.output = "Screenshot saved as dailycheck-today.png";
			}
		},
		{
			title: "Closing browser",
			task: async (ctx, task) => {
				await browser.close();
			},
		}
	])

	try {
		await listr.run();
	} catch {
		process.exit(1);
	}
	// const browser = await playwright['firefox'].launch({ headless: false });
	// const page = await context.newPage();
	// daily check loaded! Let's begin the speedrun!
}

let sleep = (time) => new Promise((resolve, reject) => {
	// We call resolve(...) when what we were doing asynchronously was successful, and reject(...) when it failed.
	// In this example, we use setTimeout(...) to simulate async code. 
	// In reality, you will probably be using something like XHR or an HTML5 API.
	setTimeout(function () {
		resolve()  // Yay! Everything went well!
	}, time)
}) 
