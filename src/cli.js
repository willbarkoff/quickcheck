import dotenv from 'dotenv'
import arg from 'arg'

import quickcheck from './quickcheck'
import configure from './configure'

export async function cli() {
	dotenv.config();

	const args = arg({
		// Types
		'--help': Boolean,
		'--configure': Boolean,

		// Aliases
		'-c': '--configure',
		'--config': '--configure',    // -n <string>; result is stored in --name
	});

	if (args["--help"]) {
		console.log("Visit https://willbarkoff.dev/quickcheck for help.")
	} else if (args["--configure"]) {
		configure();
	} else {
		quickcheck();
	}
}