import inquirer from 'inquirer';
import c from 'ansi-colors'
import fs from 'fs'
import untildify from 'untildify'

export default async function configure() {
	console.log(c.bold("First, let's get some information about you."))
	console.log(c.gray(`${c.bold.underline("Psst!")} Don't worry, none of this information will leave your computer.`))
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

	console.log(c.bold("\nAwesome! I'm saving your settings now."))
	console.log(c.gray(`They'll be saved in the file ~/.quickcheck.json`))

	let configData = {
		login: personal,
		dailyCheck: dailyCheck
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