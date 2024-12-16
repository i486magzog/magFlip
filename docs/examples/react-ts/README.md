# Installation

```bash
# Make sure you are in the /docs/examples directory
npm create vite@latest react-ts --template react-ts
cd react-ts
npm install
```

# Run the app
```
npm run dev
```

# Contribute

```bash
# Move to the /packages directory
cd core
npm link
cd ../flipview
npm link
# Move to the /docs/examples/react-ts directory
cd ../../react-ts
npm link @magflip/core @magflip/flipview
# Check if the packages are linked correctly
npm list
```

