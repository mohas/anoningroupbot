# Telegram Anonymous Messaging Bot

This is a simple Telegram bot that allows users to send anonymous messages within groups. Users can register in a group and then send messages to other registered users without revealing their identity.

## Features

- **User Registration**: Users can register in a group using the `/register` command.
- **Anonymous Messaging**: Users can send messages to other group members anonymously.
- **Group Management**: The bot keeps track of users and groups in a JSON file.
- **No Messages are saved**: bot does not save any messages, just forwards them

## Requirements

- Node.js
- pnpm
- A Telegram bot token (you can create a bot using the [BotFather](https://core.telegram.org/bots#botfather))

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Use Dockerfile to build an image

   ```bash
   docker build -t anonbot .
   ```

3. create a storage.json to be used as bind mount
   ```bash
   touch storage.json
   chmod 666 storage.json
   ```

4. Run using container and passing environment variables or docker compose...

   ```plaintext
   docker run anonbot -e TELEGRAM_BOT_TOKEN=xxxxxx
   ```

## Usage

1. Add the bot to your group also start conversation with the bot, so it can send messages to you

2. In that Telegram group, use the command `/register` to register yourself.

3. To send an anonymous message, send a message to the bot in a private chat. The bot will prompt you to select a recipient from the registered users in the group.

4. Choose a recipient, and your message will be sent anonymously.

## Code Overview

- **Environment Configuration**: The bot uses `dotenv` to load environment variables from a `.env` file or environment variables.
- **Telegram Bot Initialization**: The bot is initialized with the provided token and set to polling mode.
- **User and Group Management**: Users and groups are stored in a JSON file, allowing for persistent storage.
- **Message Handling**: The bot handles registration, message sending, and callback queries for user interactions.

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements.

## License

This project is licensed under the MIT License.