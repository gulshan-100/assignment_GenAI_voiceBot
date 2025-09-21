# AI Voice Portfolio Bot

## Overview
The AI Voice Portfolio Bot is a web application that allows users to interact with an AI assistant to learn about the portfolio of Gulshan Kumar. The bot is powered by OpenAI, LangChain, and FAISS, and includes features such as voice input, etc.

## Features
- **AI-Powered Chatbot**: Ask questions about the portfolio and receive intelligent responses.
- **Voice Interaction**: Use voice commands to interact with the bot.
- **User-Friendly Interface**: Modern and responsive design for seamless interaction.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/gulshan-100/assignment_GenAI_voiceBot.git
   ```
2. Navigate to the project directory:
   ```bash
   cd assignment_GenAI_voiceBot
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up the environment variables:
   - Create a `.env` file in the root directory.
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY="your_openai_api_key"
     ```
5. Run the application:
   ```bash
   python app.py
   ```

## Usage
1. Open your browser and navigate to `http://127.0.0.1:5000`.
2. Interact with the chatbot by typing or using voice commands.
3. Click the "View Resume" button to access the resume.

## Project Structure
- `app.py`: Main Flask application.
- `templates/`: HTML templates for the web interface.
- `static/`: Static files such as CSS, JavaScript, and the resume PDF.
- `portfolio_vectorstore/`: FAISS index files for portfolio content.
- `requirements.txt`: List of Python dependencies.

## Technologies Used
- **Flask**: Web framework for Python.
- **OpenAI API**: For generating intelligent responses.
- **LangChain**: Framework for building language model applications.
- **FAISS**: Library for efficient similarity search.
- **Bootstrap**: For responsive and modern UI design.
