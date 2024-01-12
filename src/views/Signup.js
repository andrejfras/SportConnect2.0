import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, VStack, Flex, Heading } from '@chakra-ui/react';
import { signUp } from '../services/supabaseAuthService';
import supabase from '../services/supabaseClient';
import './css/Signup.css';

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
    <Flex width="100vw" height="100vh" justifyContent="center" alignItems="center">
      <VStack spacing={4} className="custom-form">
        <Heading className="custom-heading">Sign Up</Heading>
          <FormControl id="email" className="custom-form-control">
            <FormLabel>Email address</FormLabel>
            <Input
              className="custom-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl id="password">
            <FormLabel>Password</FormLabel>
            <Input
              className="custom-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
        {error && <Box color="red.500">{error}</Box>}
        <Button colorScheme="blue" onClick={handleSignup}>Sign Up</Button>
      </VStack>
    </Flex>
  );
}

export default Signup;
