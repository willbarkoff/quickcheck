import inquirer from 'inquirer';
import c from 'ansi-colors'
import fs from 'fs'
import untildify from 'untildify'
import open from 'open'

export const defaultSettings = {
	timeout: 1000,
	headless: false
}

export default async function configure() {
	console.log(c.bold("First things first! Do you aggree to the terms and conditions of Quick Check?"))
	console.log(c.gray("They're available at https://g.willbarkoff.dev/qcterms. Note that they're subject to change at any time."))
	let terms = await inquirer.prompt([
		{
			type: 'list',
			name: 'terms',
			message: "Do you agree to the terms and conditions of use?",
			choices: [
				{
					name: "Open in browser",
					value: "browser"
				},
				new inquirer.Separator(),
				{
					name: "Yes",
					value: "yes"
				},
				{
					name: "No",
					value: "no"
				},
			]
		}
	])

	if (terms.terms == "browser") {
		process.stdout.write("Launching browser...")
		try {
			await open("https://g.willbarkoff.dev/qcterms");
			console.log(c.green(" Success!"))
		} catch {
			console.log(c.red.bold("An error occured launching the browser."))
			console.log("Don't worry, just head over to https://g.willbarkoff.dev/qcterms.")
		} finally {
			console.log(`When you get back, just run ${c.bold("quickcheck --config")} again. I'll be waiting :)`)
			return;
		}
	} else if (terms.terms == "no") {
		console.log(c.red.bold("You must accept the terms to use Quick Check."))
		console.log(`I totally understand if you don't want to accept them now. If you do in the future, just run ${c.bold("quickcheck --config")} again and we'll get back to it.`)
		return
	}

	let affirmationTime = new Date().getTime();

	console.log(c.bold("\nOk cool! Now that that's over with, let's get some information about you."))
	console.log(c.gray(`Don't worry, none of this information will leave your computer.`))
	let personal = await inquirer.prompt([
		{
			type: 'input',
			name: 'netID',
			message: 'What is your Cornell NetID?'
		},
		{
			type: 'password',
			name: 'password',
			message: 'What is your NetID password?',
			mask: '•'
		}
	])
	console.log(c.bold("\nAwesome! Now, fill out your Daily Check."))
	console.log(c.gray(`We'll store these responses and use them to fill out the daily check for you!`))

	let dailyCheck = await inquirer.prompt([
		{
			type: "confirm",
			name: "positivetestever",
			message: "Have you ever been diagnosed with/tested positive for COVID-19?",
		},
		{
			type: "list",
			name: "positivetest",
			message: "How recently were you diagnosed/tested positive for COVID-19?",
			choices: [
				{ name: "Before Aug 13, 2020", value: "positivetest-no" },
				{ name: "After Aug 13 and more than 14 days ago", value: "positivetest-yes-nap" },
				{ name: "Less than 14 days ago", value: "positivetest-yes" }
			],
			when: (prevAnswers) => prevAnswers.positivetestever
		},
		{
			type: "confirm",
			name: "covidsymptoms",
			message: "Have you experienced any symptoms of COVID-19 within the past 14-days?",
		},
		{
			type: "confirm",
			name: "telemedvisit",
			message: "Have you had a Cayuga Health or Cornell Health telemedicine visit for these symptoms?",
			when: (prevAnswers) => prevAnswers.covidsymptoms
		},
		{
			type: "confirm",
			name: "symptomsworsened",
			message: "Have your symptoms worsened?",
			when: (prevAnswers) => prevAnswers.covidsymptoms && prevAnswers.telemedvisit
		},
		{
			type: "confirm",
			name: "cleared",
			message: "Have you been cleared by Cayuga Health or Cornell Health to return to campus?",
			when: (prevAnswers) => prevAnswers.covidsymptoms && prevAnswers.telemedvisit && !prevAnswers.symptomsworsened
		},
		{
			type: "confirm",
			name: "contactdiagnosed",
			message: "Have you knowingly been in close-contact with anyone who has tested positive for, or been diagnosed with, COVID-19 in the past 14 days?"
		},
		{
			type: "confirm",
			name: "contactsymptoms",
			message: "Have you knowingly been in close-contact with anyone who currently has or had symptoms of COVID-19 in the past 14 days?"
		},
		{
			type: "confirm",
			name: "contacttelemedvisit",
			message: "Have you had a Cayuga Health or Cornell Health telemedicine visit for this close contact?",
			when: (prevAnswers) => prevAnswers.contactdiagnosed || prevAnswers.contactsymptoms
		},
		{
			type: "confirm",
			name: "clearedcontact",
			message: "Have you been cleared by Cayuga Health or Cornell Health to return to campus?",
			when: (prevAnswers) => (prevAnswers.contactdiagnosed || prevAnswers.contactsymptoms) && prevAnswers.contacttelemedvisit
		},
	])

	console.log(c.bold("\nPerfect! That should be the last daily check you ever do!"))
	console.log(c.gray(`If you ever need to change your answers, just run quickcheck --config again.`))
	let confirm = await inquirer.prompt([
		{
			type: "confirm",
			name: "correct",
			message: "Does everything above look correct to you."
		}
	])

	if (!confirm.correct) {
		console.log(c.bold("\nOk, let's fix that."))
		console.log(`Just run quickcheck --config again.`)
		console.log(c.red("Aborting..."))
		return;
	}

	if (
		(dailyCheck.positivetestever && dailyCheck.positivetest == "positivetest-yes") ||
		(dailyCheck.covidsymptoms && (!dailyCheck.telemedvisit || dailyCheck.telemedvisit && (dailyCheck.symptomsworsened || !dailyCheck.cleared))) ||
		((dailyCheck.contactdiagnosed || dailyCheck.contactsymptoms) && (!dailyCheck.contacttelemedvisit || !dailyCheck.clearedcontact))
	) {
		// daily check failed
		console.log(`\nYour check in status is ${c.red("RED")}`)
		console.log(c.bold("Do Not Proceed to Campus."))
		console.log(c.gray("Please contact Cornell Health at 607-255-5155."))
	} else {
		// daily check passed
		console.log(`\nYour check in status is ${c.green("GREEN")}`)
		console.log(c.bold("You May Proceed to Campus - Follow Cornell’s Face Covering Requirements."))
		console.log(c.gray("Thank you for completing your Daily Check. You may proceed to campus. Please continue monitoring your health and follow university guidelines for social distancing and personal hygiene while on campus. If you develop symptoms while on campus, contact Cornell Health at 607-255-5155."))
	}

	console.log(c.bold("\nNow to the fun stuff!"))
	console.log(c.gray(`These settings can be changed at any time.`))
	let promptAdvanced = await inquirer.prompt([
		{
			type: "confirm",
			name: "correct",
			message: "Do you want to configure any advanced options?"
		}
	])

	let advancedResponses = defaultSettings;

	if (promptAdvanced) {
		advancedResponses = await inquirer.prompt([
			{
				type: "number",
				default: advancedResponses.timeout,
				name: "timeout",
				message: "How long should Quick Check wait for the CAPTCHA timeout (ms)?"
			},
			{
				type: "confirm",
				default: false,
				name: "headless",
				message: "Should Quick Check run headlessly? This is faster, but less fun."
			}
		])
	}

	console.log(c.bold("\nAwesome! I'm saving your settings now."))
	console.log(c.gray(`They'll be saved in the file ~/.quickcheck.json`))

	let configData = {
		affirmationTime: affirmationTime,
		login: personal,
		dailyCheck: dailyCheck,
		settings: advancedResponses
	}

	try {
		fs.writeFileSync(untildify("~/.quickcheck.json"), JSON.stringify(configData), { flag: 'w+' })
	} catch (e) {
		console.log(c.red("\nAn error occured saving your data."))
		console.log(c.gray(`More information should be below.`))

		throw e;
	}

	console.log(c.bold.green("\nSaved!"))
	console.log(`If you ever need to make changes, just run ${c.bold("quickcheck --config")} again!`)

}