#plex-webhook-recently-added
> :link: Runs webhooks with recently added items from your Plex server

##Install
1. Clone the repo
2. `yarn`
3. Use `.env-sample` to create your own `.env`
4. Use `cron` to run the task every `X (days|minutes|hours etc)` along with configuring the `UPDATED_AT_FILTER_VALUE` and `UPDATED_AT_FILTER_UNIT` to match
5. Configure your webhook(s) to receive the JSON payload and do with it what you will
