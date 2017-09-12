/* Configuration */
var config = {
	tqu: {
		refreshrate: 10000,				// Milliseconds (1s = 1000ms)
		humanize_queuetime: true
	},
	msg: {
		refreshrate: 30000,				// Milliseconds (1s = 1000ms)
		message: {
			default_expiration: 999,	// Hours
			min_expiration: 1,			// Hours
			max_expiration: 999			// Hours
		},
		waitingtime: {
			default_expiration: 5,		// Hours
			min_expiration: 1,			// Hours
			max_expiration: 24,			// Hours
			min_waitingtime: 1,			// Hours
			max_waitingtime: 24			// Hours
		}
	}
}