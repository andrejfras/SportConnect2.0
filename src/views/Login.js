import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, VStack, Flex, Heading } from '@chakra-ui/react';
import { signIn } from '../services/supabaseAuthService';
import './css/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { user, error } = await signIn(email, password);
      if (error) throw error;

      console.log('User logged in:', user);
      navigate('/home');
    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
    }
  };

  return (
    <Flex
    height="50vh" // Full viewport height
    alignItems="center" // Vertically aligns children in the center
    justifyContent="center"
    textAlign='left' // Horizontally aligns children in the center
    >
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
      <VStack spacing={4}>
          <Heading className="heading">Login</Heading>
          <FormControl id="email">
            <FormLabel className="heading">Email address</FormLabel>
            <Input
              className='logininput'
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl id="password">
            <FormLabel className="heading">Password</FormLabel>
            <Input 
              className='logininput'
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          {error && <Box color="red.500">{error}</Box>}
          <Button colorScheme="blue" className='loginbutton' onClick={handleLogin}>Login</Button>
        </VStack>
      </Box>
    </Flex>
  );
}

export default Login;