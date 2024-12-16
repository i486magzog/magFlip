// import { useState } from 'react'
import { useState } from 'react';
import './App.css';
import { Example2 } from './Example2';
import { Example1 } from './Example1';
function App() {
  const [curExample, setCurExample] = useState<React.ReactNode | null>(null);
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '5rem', gap: '1rem' }}>
        {curExample === null 
          ? (
            <>
              <button onClick={() => setCurExample(<Example1 />)}>
                Example 1
              </button>

              <button onClick={() => setCurExample(<Example2 />)}>
                Example 2
              </button>
            </>
          ) 
          : (
            <button onClick={() => setCurExample(null)}>
              Home
            </button>
          )
        }
      </div>
      {curExample}
    </>
  )
}

export default App
