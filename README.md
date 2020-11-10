# Quick Check

Quick Check is a program to run the Daily Check for you! It does it quickly (usually in under 10 seconds, depending on the speed of your internet connection.)

> By using this program, you affirm that you are submitting a true and complete Daily Check. Submitting a false Daily Check puts everyone at Cornell at risk. Don't do that. That is bad.

Install it with `npm` or `yarn`. If you don't have either installed, you can install `npm` by downloading Node.js, which can be done [here](https://nodejs.org/en/).

```shell
$ npm i -g cu-quickcheck
$ yarn global add cu-quickcheck
```

Note that Quick Check installs an instance of Firefox, which does take up a bit of space (about 187 MB). You can look into alternate options on [this page](https://playwright.dev/#?path=docs/installation.md). Note that only Firefox is officially supported, and your mileage may vary with other browsers.

⚠️ As of right now, Quick Check assumes that you **have never been diagnosed with COVID-19**, **you are not experiencing any COVID-19 symptoms**, and that **you have not been in close contact with anyone experiencing COVID-19 symptoms or who has tested positive for COVID-19**. If any of these statements are not true for you, **please do not use Quick Check at this time**.

## Running Quick Check

Quick Check takes two environment variables when it's run, `NETID` and `NETID_PASSWORD`. Quick Check also supports `.env` files, meaning you can create a `.env` file to more easily manage your environment variables. Note that the `.env` file must be located in the same director that you run Quick Check from.

Quick Check takes no arguments as of right now.
```shell
$ quickcheck # runs quickcheck
$ NETID=ab123 NETID_PASSWORD=superSecret1 quickcheck # runs quickcheck with a given netID and password
$ echo 'NETID=ab123' >> .env
$ echo 'NETID_PASSWORD=superSecret1' >> .env
$ quickcheck
```

### Creating a Desktop Shortcut for Quick Check

You can create a simple shell script to run Quick Check, then put that on your desktop, and double click it to run. Note that on macOS your file must end in `.command` for it to be run with terminal by default. Otherwise, it will open in Xcode. You can see the [run.command](./run.command) file for an example.

## Reporting Bugs

Bugs and issues can be reported on the [GitHub issues page](https://github.com/willbarkoff/quickcheck/issues).


## Quick Check's security

Quick Check deals with some pretty sensitive data, your NetID and password, as well as your Daily Check data. Storing sensitive data (such as API Keys and passwords) as environment variables is the industry standard.

**Quick Check does not transmit any data outside your computer, apart from sending data to CUWebLogin and the Daily Check website**

If you find any security flaws, you can shoot me an email ([william@barkoffusa.com](mailto:william@barkoffusa.com)) and encrypt it with my [PGP Key](https://willbarkoff.dev/key.html). I'll do my best to patch it as quickly as I can, and I'll make sure to credit you!

## Roadmap
The current roadmap for Quick Check can be found in the [GitHub issues](https://github.com/willbarkoff/quickcheck).