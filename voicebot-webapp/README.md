# Voice Bot Web Application

This project is a voice bot web application built using Flask and the OpenAI API. The application allows users to interact with a voice bot that responds to various questions.

## Project Structure

```
voicebot-webapp
├── app.py               # Main application file that sets up the Flask server
├── requirements.txt     # Lists dependencies required for the project
├── static
│   ├── css
│   │   └── style.css    # CSS styles for the web application
│   └── js
│       └── main.js      # JavaScript code for user interactions
├── templates
│   └── index.html       # Main HTML template for the web application
└── README.md            # Documentation for the project
```

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd voicebot-webapp
   ```

2. **Install Dependencies**
   Make sure you have Python and pip installed. Then, run:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Application**
   Start the Flask server by executing:
   ```bash
   python app.py
   ```
   The application will be accessible at `http://127.0.0.1:5000`.

## Usage Guidelines

- Open the web application in your browser.
- Use the microphone button to ask questions to the voice bot.
- The bot will respond based on the predefined questions and answers.

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements for the project.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.