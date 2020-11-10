import playwright from 'playwright-firefox'
import dotenv from 'dotenv'

export async function cli() {
	dotenv.config()
	const netID = process.env.NETID;
	const password = process.env.NETID_PASSWORD;

	const browser = await playwright['firefox'].launch({ headless: false });
	const context = await browser.newContext();
	const page = await context.newPage();
	await page.goto('https://dailycheck.cornell.edu/saml_login_user?redirect=%2Fdaily-checkin');
	// daily check loaded! Let's begin the speedrun!
	await page.fill("#netid", netID);
	await page.fill("#password", password);
	await page.click(".input-submit");

	// show confirmation
	await page.waitForNavigation({
		url: "https://dailycheck.cornell.edu/daily-checkin"
	})
	await page.screenshot({ path: `dailycheck-today.png` })

	await browser.close();
}