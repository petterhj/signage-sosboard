// 	SOSBoard
// ===========================================================================

var SOSBOARD = SOSBOARD || {
	// App
	debug: false,
	editMode: false,

	// Init
	init: function() {
		this.debug = $('body').hasClass('py-debug');

		console.log('[SOSBOARD] Initializing... ');

		// Start modules
		this.telephonequeue.start();
    	this.messages.start();

    	// Keyboard 
		$(document).keydown(function(e){
			// Esc: Toggle edit mode
			if (e.keyCode == 27) {
				console.log('Key: ESC');
				if (SOSBOARD.editMode) {
					SOSBOARD.messages.cancel();
				} else {
					SOSBOARD.messages.edit();
				}
			}
			// Enter: Save
			if (e.keyCode == 13) {
				console.log('Key: Enter');
				if (SOSBOARD.editMode) {
					SOSBOARD.messages.save();
				}
			}
		});

		// Theme selector
		$('div#themes > div.theme').click(function(){
			SOSBOARD.setTheme($(this).data('theme'));
		});

		// Debug
		if (this.debug) {
			this.debugMode();
		}
	},

	// Themeing
	setTheme: function(theme) {
		$('body').removeClass(function(index, css) {
		    return (css.match (/(^|\s)theme-\S+/g) || []).join(' ');
		}).addClass('theme-' + theme);
	},

	// Debug mode
	debugMode: function() {
		$('body').addClass('js-debug');

		// Pause timers
		// this.telephonequeue.timer.pause();
		// this.messages.timer.pause();
	},


	// 	Telephone queue
	// ===========================================================================
	telephonequeue: {
		card: null,
		timer: null,
		refreshrate: config.tqu.refreshrate,

		// Start
		start: function() {
			console.log('[SOSBOARD][TQU] Starting (debug = ' + SOSBOARD.debug + ')...');

			// Card
			this.card = $('div#telephone');
			
			// Timer
			this.timer = $.timer(function() {
        		SOSBOARD.telephonequeue.update();
    		}).set({time: SOSBOARD.telephonequeue.refreshrate, autostart: false});

			// Update
			this.update(); 

			// Start timer
			this.timer.play();

    		console.log('[SOSBOARD][TQU] Timer activated: ' + this.timer.isActive + ' (refreshrate = ' + this.refreshrate + ')');
		},

		// Update
		update: function() {
			console.log('[SOSBOARD][TQU] Updating telephone queue...');

			// Card
			var card = this.card;

			// Status
			var spinner = this.card.parent().find('i.zmdi-refresh').show();

			// Get data
			card.attr('data-status', 'inactive');

			$.getJSON('/json/telephonequeue', function(data) {
				// Clear card
				card.html('');

				// Lines
	  			$.each(data.queue, function(i, line_data) {
	  				// Line
	  				if (parseInt(line_data.queuenow) > 0) {
		  				card.append(SOSBOARD.telephonequeue.elements.lineQueue(line_data.prettyname, line_data.queuenow, line_data.longestqueued));
		  			}
	  			});

	  			spinner.hide();
	  			card.attr('data-status', (data.success ? 'active' : 'error'));

	  			// Error message
	  			if (!data.success) {
	  				card.append($('<div>', {class: 'error'}).text(data.message));
	  			}

	  			console.log('[SOSBOARD][TQU] Done updating');
			})
			.error(function() {
				card.attr('data-status', 'error');
			});
		},

		// Elements
		elements: {
			// Line queue
			lineQueue: function(name, queue, longestqueued) {
				var queuetime = (config.tqu.humanize_queuetime ? moment.duration(parseInt(longestqueued), 'seconds').format('m[m], s[s]') : longestqueued + 's');

				var line = $('<div>', {class: 'line'})
		  			.append($('<i>', {class: 'zmdi zmdi-phone-ring'}))
					.append($('<input>', {
						type: 'text',
						name: 'title',
						value: name,
						disabled: true
					}))
		  			.append($('<span>', {class: 'floater red'})
						.append($('<input>', {
							type: 'text', 
							name: 'queue', 
							value: queue,
							disabled: true
						}))
					)
					.append($('<span>', {class: 'floater satellite'}).text(queuetime))

		  		return line;
			},
		}
	},

	// 	Messages
	// ===========================================================================
	messages: {
		card: null,
		timer: null,
		deleted: [],

		// Start
		start: function() {
			console.log('[SOSBOARD][MSG] Starting (debug = ' + SOSBOARD.debug + ')...');

			// Card
			this.card = $('div#waitingtime');

			// Timer
			this.timer = $.timer(function() {
        		SOSBOARD.messages.update();
    		}).set({ time: config.msg.refreshrate, autostart: false });

			// Update
			this.update();

			// Start timer
			this.timer.play();

    		console.log('[SOSBOARD][MSG] Timer activated: ' + this.timer.isActive + ' (refreshrate = ' + config.msg.refreshrate + ')');
		},

		// Update
		update: function() {
			console.log('[SOSBOARD][MSG] Updating messages...');

			// Card
			var card = this.card;

			// Spinner
			var spinner = this.card.parent().find('i.zmdi-refresh').show();

			// Get data
			card.attr('data-status', 'inactive');

			$.getJSON('/json/waittimes', function(data) {
				// Clear card
				// SOSBOARD.messages.card.html('');
				SOSBOARD.messages.card.find('div.line').remove();

				// Lines
	  			$.each(data.waiting_times, function(i, msg) {
	  				if (msg.hours) {
	  					// Waiting time
	  					var s = SOSBOARD.messages.elements.waitingTime(msg.sid, msg.station, msg.hours, msg.comment, msg.created, msg.expires);
	  				} else {
	  					// Message
	  					var s = SOSBOARD.messages.elements.message(msg.sid, msg.station, msg.comment, msg.created, msg.expires);
	  				}

	  				// Append
		  			SOSBOARD.messages.card.append(s);

		  			SOSBOARD.messages.card.find('div.line > div.comment').each(function(){
						if ($(this).find('input').val() != ''){
							$(this).show();
						}
					});
	  			});

	  			spinner.hide();
	  			card.attr('data-status', (data.success ? 'active' : 'error'));

	  			// Error message
	  			if (!data.success) {
	  				card.append($('<div>', {class: 'error'}).text(data.message));
	  			}

	  			console.log('[SOSBOARD][MSG] Done updating');
			})
			.error(function(data) {
				console.log('ERROR' + data);
				card.attr('data-status', 'error');
			});
		},

		// Edit
		edit: function() {
			console.log('[SOSBOARD][MSG] Entering edit mode...');

			// Set edit mode
			SOSBOARD.editMode = true;
			this.card.find('div.line').addClass('edit');
			this.card.attr('data-status', 'inactive');

			// Show add buttons
			$('div.add.message').each(function() {
				$(this).fadeIn();

				$(this).click(function(){
					if (SOSBOARD.messages.card.find('.line.new').length == 0) {
						// New waiting time
						var msg;

						if ($(this).hasClass('msg')) {
							msg = SOSBOARD.messages.elements.message(
								0, '', '',
								moment().add(moment().utcOffset(), 'minutes'),
								moment().add(moment().utcOffset(), 'minutes').add(config.msg.message.default_expiration, 'hours')
							);
						}
						if ($(this).hasClass('wtm')) {
							msg = SOSBOARD.messages.elements.waitingTime(
								0, '', '', '', 
								moment().add(moment().utcOffset(), 'minutes'),
								moment().add(moment().utcOffset(), 'minutes').add(config.msg.waitingtime.default_expiration, 'hours')
							);
						}

						SOSBOARD.messages.card.prepend(msg);
						msg.addClass('edit new');
						msg.find('input').prop('disabled', false);
						msg.find('input').first().focus();
					}
				});
			});

			// Inputs
			this.card.find('input').prop('disabled', false);
			this.card.find('input').first().focus();

			// Pause timer
			if (this.timer) {				
				console.log('[SOSBOARD][MSG] Pausing timer...');
        		this.timer.pause();
        		console.log('[SOSBOARD][MSG] Timer active: ' + this.timer.isActive);
			}
		},

		// Save
		save: function() {
			// Check if any errors
			var errors = this.card.find('input.error').length;

			if (errors == 0) {
				// Remove new status
				this.card.find('div.line.new').removeClass('new');

				// Actually save data
				console.log('[SOSBOARD][MSG] Saving...');
				
				// Data
				var data = {
					insert: [],
					update: [],
					remove: this.deleted
				}

				$.each(this.card.find('div.line.edit:not(.add)'), function() {
					// Item
					var item = {
						sid: $(this).attr('data-sid'),
						title: $(this).find('input[name="title"]').val(),
						hours: $(this).find('input[name="hours"]').val(),
						comment: $(this).find('input[name="comment"]').val(),
						expires: $(this).find('input[name="expires"]').val()
					}

					if (item.sid == 0) {
						data.insert.push(item);
					} else {
						data.update.push(item);
					}
				});

				console.log('  * Insert: ' + data.insert.length);
				console.log('  * Update: ' + data.update.length);
				console.log('  * Remove: ' + data.remove.length);

				// Post data to server
				$.ajax({
					url: '/update/waittimes',
					type: 'POST',
					data: JSON.stringify(data),
					contentType: 'application/json; charset=utf-8',
					dataType: 'json'
				})
				.done(function(status) {
					// Success
					if (status.success) {
						console.log('[SOSBOARD][MSG] Done saving');
					}
					// Error
					else {
						console.log('[SOSBOARD][MSG] Saving failed!');
						console.log('   > ERROR: ' + status.message);
					}
				})
				.fail(function(error) {
				    console.log('[SOSBOARD][MSG] Post request failed! (' + error.status + ' = ' + error.statusText + ')');
				  
				    alert('Serverfeil: ' + error.status + ' = ' + error.statusText);
				})
				.always(function() {
					// Exit edit mode
					SOSBOARD.messages.cancel();
				});
			} 
			else {
				console.log('[SOSBOARD][MSG] Did not pass validation (errors: ' + errors + ')');
			}
		},

		// Cancel
		cancel: function() {
			console.log('[SOSBOARD][MSG] Exiting edit mode...');

			// Remove any new (unsaved) items
			this.card.find('div.line.new').remove();

			// Exit edit mode
			this.card.find('div.line').removeClass('edit');

			// Clear deleted
			this.deleted = [];

			// Inputs
			this.card.find('input').prop('disabled', true);
			this.card.find('div.line.add').remove();

			// Hide buttons
			$('div.add.message').fadeOut();

			// Update
			this.update();

			// Unpause timer
			if (this.timer) {
				console.log('[SOSBOARD][MSG] Unpausing timer...');
        		this.timer.play();
        		console.log('[SOSBOARD][MSG] Timer active: ' + this.timer.isActive);
			}

			SOSBOARD.editMode = false;
		},

		// Validate
		validate: function(field) {
			// Properties
			var validated	= true;
			var name 		= field.attr('name');
			var value 		= field.val().replace(/,/g, '.');

			console.log('Validate field: ' + name + ' (value = ' + value + ')');

			// Rules
			$.each({
				required: 	(field.prop('required') ? (value.replace(/ /g, '') != '') : true),
				numeric: 	(field.data('numeric') ? $.isNumeric(value) : true),
				minlen: 	(field.data('minlen') ? (value.length >= field.data('minlen')) : true),
				maxval: 	(field.data('maxval') ? (value <= field.data('maxval')) : true),
				minval: 	(field.data('minval') ? (value >= field.data('minval')) : true),
			}, 
			function(rule, pass) {
				console.log('    > ' + rule + ' = ' + (pass ? 'PASS' : 'ERROR'));

				if (!pass) {
					field.addClass('error').focus();

					return false;
				} else {
					field.removeClass('error');
				}
			});
		},

		// Elements
		elements: {
			// Message
			message: function(sid, message, comment, created, expires) {
				// Create element
				var msg = $('<div>', {class: 'line message'}).attr('data-sid', sid)
					/* Icon */
					.append($('<i>', {class: 'zmdi zmdi-notifications-none'}))
					.append($('<i>', {class: 'zmdi zmdi-close'})
						.attr('title', 'Slett')
						.click(function() {
							// Remove
							if (sid > 0) {
								SOSBOARD.messages.deleted.push(sid);
							}

							$(this).parent().remove();
						})
					)
					/* Created */
					.append($('<h2>', {class: 'created'})
						.text(moment.utc(created).format('DD/MM'))
						.append($('<span>').text(moment.utc(created).format('HH:mm')))
					)
					/* Message */
					.append($('<input>', {
						'type': 'text',
						'name': 'title',
						'value': message,
						'maxlength': 60,
						'data-minlen': 2,
						'required': true,
						'disabled': true
					}))
					/* Comment */
					.append($('<div>', {class: 'comment', title: 'Kommentar'})
						.append($('<input>', {
							'type': 'text',
							'name': 'comment',
							'value': comment,
							'maxlength': 40,
							'required': false,
							'disabled': true
						}))
					)
					/* Expires */
					.append($('<div>', {class: 'expires', title: 'Varighet'})
						.append($('<input>', {
							'type': 'text',
							'name': 'expires',
							'value': moment.duration(moment(expires).diff(moment(created))).asHours().toFixed(1),
							'maxlength': 4,
							'required': true,
							'data-numeric': true,
							'data-maxval': config.msg.message.max_expiration,
							'data-minval': config.msg.message.min_expiration,
							'disabled': true
						})
						.on({
							keyup: function() {
								$(this).parent().find('span').text(moment.utc(created).add($(this).val(), 'hours').format('[Utløper] D/M, [kl.] HH:mm'));
							},
							blur: function() {
								$(this).val($(this).val().replace(/,/g, '.'));
							}
						}))
						.append($('<span>').text(moment.utc(expires).format('[Utløper] D/M, [kl.] HH:mm')))
					)

				// Validation
				msg.find('input').each(function() {
					$(this).on('blur keyup', function() {
						SOSBOARD.messages.validate($(this));
					});
				});

				return msg;
			},

			// Waiting time
			waitingTime: function(sid, station, hours, comment, created, expires) {
				// Create element
				var wt = $('<div>', {class: 'line'}).attr('data-sid', sid)
					/* Icon */
					.append($('<i>', {class: 'zmdi zmdi-timer'}))
					.append($('<i>', {class: 'zmdi zmdi-close'})
						.attr('title', 'Slett')
						.click(function() {
							// Remove
							if (sid > 0) {
								SOSBOARD.messages.deleted.push(sid);
							}

							$(this).parent().remove();
						})
					)
					/* Created */
					.append($('<h2>', {class: 'created'})
						.text(moment.utc(created).format('HH:mm'))
						.append($('<span>').text(moment.utc(created).format('DD/MM')))
					)
					/* Title */
					.append($('<input>', {
						'type': 'text',
						'name': 'title',
						'value': station,
						'maxlength': 60,
						'data-minlen': 2,
						'required': true,
						'disabled': true
					}).autocomplete({
						serviceUrl: function() {
							return '/json/stations/' + $(this).val();
					    },
					    dataType: 'json',
					    type: 'GET'
					}))
					/* Hours */
					.append($('<span>', {class: 'floater'})
						.append($('<input>', {
							'type': 'text', 
							'name': 'hours',
							'value': hours, 
							'maxlength': 3, 
							'required': true,
							'data-numeric': true,
							'data-maxval': config.msg.waitingtime.max_waitingtime,
							'data-minval': config.msg.waitingtime.min_waitingtime,
							'disabled': true
						})
						.on({
							blur: function() {
								$(this).val($(this).val().replace(/,/g, '.'));
							}
						}))
					)
					/* Comment */
					.append($('<div>', {class: 'comment', title: 'Kommentar'})
						.append($('<input>', {
							'type': 'text',
							'name': 'comment',
							'value': comment,
							'maxlength': 40,
							'required': false,
							'disabled': true
						}))
					)
					/* Expires */
					.append($('<div>', {class: 'expires', title: 'Varighet'})
						.append($('<input>', {
							'type': 'text',
							'name': 'expires',
							'value': moment.duration(moment(expires).diff(moment(created))).asHours().toFixed(1),
							'maxlength': 4,
							'required': true,
							'data-numeric': true,
							'data-maxval': config.msg.waitingtime.max_expiration,
							'data-minval': config.msg.waitingtime.min_expiration,
							'disabled': true
						})
						.on({
							keyup: function() {
								$(this).parent().find('span').text(moment.utc(created).add($(this).val(), 'hours').format('[Utløper] D/M, [kl.] HH:mm'));
							},
							blur: function() {
								$(this).val($(this).val().replace(/,/g, '.'));
							}
						}))
						.append($('<span>').text(moment.utc(expires).format('[Utløper] D/M, [kl.] HH:mm')))
					)

				// Validation
				wt.find('input').each(function() {
					$(this).on('blur keyup', function() {
						SOSBOARD.messages.validate($(this));
					});
				});

				return wt;
			}
		}
	}
};