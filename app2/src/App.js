import React from 'react';
import Test from './components/test';

const App = () => {
  const [a, b] = React.useState(false);
  return (
    <div
      style={{
        margin: '10px',
        padding: '10px',
        textAlign: 'center',
        backgroundColor: 'cyan',
      }}
    >
      <h1>App 2s</h1>
      <Test />
    </div>
  );
};

export default App;
