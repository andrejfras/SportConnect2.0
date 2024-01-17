import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Rating from './Rating';
import "./css/UserProfile.css";
import supabase from '../services/supabaseClient';

function UserProfile() {
    const { userId } = useParams();
    
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [user, setUser] = useState(null);
    const [rating, setRating] = useState(0);
    const [existingRating, setExistingRating] = useState(null);
    const [hasRated, setHasRated] = useState(false);
    const [averageRating, setAverageRating] = useState(0);


    useEffect(() => {
        const fetchUserAndProfile = async () => {
            const userResponse = await supabase.auth.getUser();
            setUser(userResponse.data.user);
    
            if (userId) {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', userId)
                    .single();
    
                if (profileError) {
                    console.error('Error fetching profile:', profileError);
                    setLoading(false);
                    return;
                }
    
                if (profile) {
                    setUsername(profile.username);
                    setName(profile.name);
                    setSurname(profile.surname);
                }
    
                // Fetch the rating after the profile has been successfully fetched
                const { data: ratingData, error: ratingError } = await supabase
                    .from('user_ratings')
                    .select('*')
                    .eq('rater_id', userResponse.data.user.id)
                    .eq('ratee_id', userId)
                    .single();
    
                if (ratingError) {
                    console.error('Error fetching rating:', ratingError);
                } else if (ratingData) {
                    setExistingRating(ratingData);
                    console.log("1", hasRated);
                    setHasRated(true);
                    setRating(ratingData.rating);
                    setReview(ratingData.review);
                } else {
                    
                    setExistingRating(null);
                    setHasRated(false);
                    console.log("2");
                }
    
                setLoading(false);
            }
        };
    
        fetchUserAndProfile();
    }, [userId]);

    useEffect(() => {
        const fetchRating = async () => {
            if (user && userId) {
                const { data, error } = await supabase
                    .from('user_ratings')
                    .select('*')
                    .eq('rater_id', user.id)
                    .eq('ratee_id', userId)
                    .single();
    
                if (error) {
                    console.error('Error fetching rating:', error);
                } else if (data) {
                    setExistingRating(data);
                    setHasRated(true);
                    console.log("3");
                } else {
                    setExistingRating(null);
                    setHasRated(false);
                    console.log("4");
                }
            }
        };
    
        fetchRating();
    }, [userId, user]);

    useEffect(() => {
        const fetchAvgRating = async () => {
            if (userId) {
                const { data: ratingsData, error: ratingsError } = await supabase
                    .from('user_ratings') // Replace 'ratings' with your actual table name
                    .select('rating')
                    .eq('ratee_id', userId);
        
                if (ratingsError) {
                    console.error('Error fetching ratings:', ratingsError);
                } else if (ratingsData.length > 0) {
                    const total = ratingsData.reduce((acc, { rating }) => acc + rating, 0);
                    const avgRating = total / ratingsData.length;
                    setAverageRating(avgRating);
                } else {
                    setAverageRating(0); // Set to 0 if no ratings found
                }
            }
        };

        console.log(averageRating);
    
        fetchAvgRating();
    }, [userId]);


    const handleDeleteRating = async () => {
        try {
            const { error } = await supabase
                .from('user_ratings')
                .delete()
                .match({ id: existingRating.id });

            if (error) throw error;

            setExistingRating(null);
            setHasRated(true);
            setRating(0);
            setReview('');
            console.log('Rating deleted');
        } catch (error) {
            console.error('Error deleting rating:', error);
        }
    };

    const submitRating = async (newRating, newReview) => {
        try {
            console.log('hasRated:', hasRated, 'existingRating:', existingRating);
    
            // Check if the user has already rated and the existingRating is available
            if (hasRated && existingRating) {
                console.log('Attempting to delete existing rating for user:', userId, 'with rater ID:', user.id);
                
                const { error: deleteError } = await supabase
                    .from('user_ratings')
                    .delete()
                    .match({ ratee_id: userId, rater_id: user.id });
    
                if (deleteError) {
                    console.error('Error deleting rating:', deleteError);
                    throw deleteError;
                } else {
                    console.log('Existing rating deleted successfully');
                }
            }
    
            // Insert the new rating
            console.log('Inserting new rating');
            const { data, error: insertError } = await supabase
                .from('user_ratings')
                .insert([{ ratee_id: userId, rater_id: user.id, rating: newRating, review: newReview }]);
    
            if (insertError) {
                console.error('Error inserting new rating:', insertError);
                throw insertError;
            }
    
            if (data && data.length > 0) {
                setExistingRating(data[0]);
                setHasRated(true);
                console.log('New rating submitted:', data[0]);
            } else {
                console.error('No data returned on rating insert');
            }
        } catch (error) {
            console.error('Error in submitRating:', error);
        }
    };
    
    
    const handleRateUser = (rateeId, rating) => {
        submitRating(rating, review);
    };

    return (
        <div>
            <h1>User Profile</h1>
            <p>Username: {username}</p>
            <p>Id: {userId}</p>
            <p>Name: {name}</p>
            <p>Average Rating: {averageRating.toFixed(1)}</p> {/* Formatting to one decimal place */}
            <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write a review"
            />
            {hasRated ? (
                <div>
                    <Rating onRate={(rateeId, rating) => handleRateUser(rateeId, rating)} rateeId={userId} />
                    <button onClick={handleDeleteRating}>Delete Rating</button>
                </div>
            ) : (
                <Rating onRate={handleRateUser} rateeId={userId} />
            )}
        </div>
    );
}

export default UserProfile;
