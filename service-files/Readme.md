# Service Files Documentation

Edit the files to your needs

## Main service

`ck_speller.service` is the main one, runs the speller service, should restart on failure

## If service is flaky

Scripts and services to check health, restart service on failure, install and enable all three `.service` and `.timer` files.

- check_languages.sh - mails user on failure, check if service is running at all, and check for correct output if running
- ck_health.timer - runs health check on a regular basis
- ck_health.service - runs check_languages.sh, calls ck_restart.service on failure
- ch_restart.service - restart the speller service

## Enable services and timers

Copy .service and .timer files as needed to `~/.config/systemd/user/`

- Reload systemd to recognize the new services: `systemctl --user daemon-reload`
- Enable service and timer: `systemctl --user enable <name-of-service-or-timer-file>`
- Start the service or timer: `systemctl --user start <name-of-service-or-timer-file>`

- Check the status of the service: `systemctl --user status <name-of-service>.service`
- Check the timer status: `systemctl --user list-timers`
