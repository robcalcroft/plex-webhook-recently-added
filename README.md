#plex-webhook-recently-added
> :link: Runs webhooks with recently added items from your Plex server

##Install
1. Clone the repo
2. `yarn`
3. Use `.env-sample` to create your own `.env`
4. Use `cron` to run the task every `X (days|minutes|hours etc)` along with configuring the `UPDATED_AT_FILTER_VALUE` and `UPDATED_AT_FILTER_UNIT` to match. Run with `./plex-webhook-recently-added.js`
5. Configure your webhook(s) to receive the JSON payload and do with it what you will

###JSON Payload
```javascript
[
  "Movie Name Here",
  "Movie Name Here 2",
  "Movie Name Here 3",
  "TV Show Name Here Season 1",
  "TV Show Name Here Season 2",
  "TV Show Name Here Season 3",
]
```

##Telegram Bot
A prime example for using these webhooks is in a Telegram Bot, you can use https://gist.github.com/robcalcroft/4aee25941db5b48d641348076d5369d8 to run your own one that will notify users once they have run `/start` in Telegram.
