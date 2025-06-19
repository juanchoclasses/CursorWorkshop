# Cursor Tips for Students

## Three Modes

- **Agent Mode**: Most powerful, can run commands and your app (use this for the workshop)
- **Ask Mode**: Questions and explanations only
- **Manual Mode**: Traditional coding with suggestions

## Getting Started

- First time using Agent mode? Select **"Auto Run"** when prompted
- Agent can run terminal commands, start your app, analyze output

## Model Selection

- **Auto**: Usually fastest
- **claude-4-sonnet**: Very good at coding, slightly slower (recommended for this workshop)
- **gemini-2.5-pro** and **o3**: Can think through complex tasks (but slow)
- **MAX Mode**: Extra $$$ (5 cents per request)

## Testing Strategy (important!)

- **Tests are KEY** - your only real way to ensure agent doesn't break things (and oh it will)
- **Start writing tests very early**
- **Possible approach**: Ask the agent this: "Write tests first, then the code, then run the tests and update the code until tests pass"
- For this workshop, what if you ask agent to write comprehensive integration tests based on documentation, THEN ask it to write code

## Logging

- Logging can help you debug and the agent can use it to debug itself
- Ask the agent: "Please add logging statements to your code as you go"

## Key Tips

- **Agent remembers context** within same session - it builds on previous work
- **Can get you very far** - sometimes further than expected (this is normal!)

## More Fun Experiments

- Try: "Please maintain a changelog. Every prompt and result should be briefly mentioned in the changelog. Update the changelog as we go."
- Try: "Please manage git commits for me. Auto commit when needed with meaningful commit messages."

