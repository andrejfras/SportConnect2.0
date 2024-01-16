import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, VStack, Flex, Heading } from '@chakra-ui/react';
import { signUp } from '../services/supabaseAuthService';
import supabase from '../services/supabaseClient';
import './css/Login.css';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();


  const createUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ user_id: userId.user.id, username: email }]);

      if (error) throw error;
      console.log('Profile created:', data);
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
  
    try {
      const { user, error: signUpError } = await signUp(email, password);
      if (signUpError) throw signUpError;

      if (user) {
        console.log('User signed up:', user.user.id);
        await createUserProfile(user);
        navigate('/login');
      } else {
        setError('Failed to sign up.');
      }
    } catch (err) {
      setError(err.message);
      console.error('Signup error:', err);
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
        <Heading className="heading">Register</Heading>
          <FormControl id="email" className="login-input">
            <FormLabel className="heading">Email address</FormLabel>
            <Input className="login-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
          </FormControl>
          <FormControl id="password" className="login-input">
            <FormLabel className="heading">Password</FormLabel>
            <Input className="login-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Choose a password" type="password" />
          </FormControl>
        {error && <Box color="red.500">{error}</Box>}
        <Button onClick={handleSignup}>Sign Up</Button>
      </VStack>
      </Box>
    </Flex>
  );
}

export default Signup;
