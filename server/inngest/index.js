    import { Inngest } from "inngest";
    import { connectDB } from '../configs/db.js';
    import User from "../models/User.js";

    // Create a client to send and receive events
    export const inngest = new Inngest({ id: "my-app" });

    // Inngest Function to save user data to a database
    const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    {event: 'clerk/user.created'},
    async ({event, step}) => {
        try {
            await connectDB();
            
            const {id, first_name, last_name, email_addresses, image_url} = event.data;
            console.log('Processing user creation for:', email_addresses[0]?.email_address);
            
            if (!email_addresses?.[0]?.email_address) {
                throw new Error('No email address provided');
            }

            let username = email_addresses[0].email_address.split('@')[0];
            const user = await User.findOne({username});

            if (user) {
                username = `${username}${Math.floor(Math.random() * 10000)}`;
            }

            const userData = {
                _id: id,
                email: email_addresses[0].email_address,
                full_name: `${first_name} ${last_name}`.trim(),
                profile_picture: image_url || '',
                username
            };
            // Di syncUserCreation function, sebelum create user
            console.log('Trying to create user with data:', {
                email: email_addresses[0].email_address,
                username
            });

            const newUser = await User.create(userData);
            console.log('User created in database:', newUser);
            
            return { success: true, userId: newUser._id };
        } catch (error) {
            console.error('Error in syncUserCreation:', error);
            throw error; // This will trigger Inngest retry
        }
    }
)

        // Inngest Function to update user data to a database
    const syncUserUpdation = inngest.createFunction(
        {id: 'update-user-from-clerk'},
        {event: 'clerk/user.updated'},
        async ({event}) => {
            try {
                await connectDB();
                
                const {id, first_name, last_name, email_addresses, image_url} = event.data;
                console.log('Updating user:', id);

                if (!email_addresses?.[0]?.email_address) {
                    throw new Error('No email address provided');
                }

                const updatedUserData = {
                    email: email_addresses[0].email_address,
                    full_name: `${first_name} ${last_name}`.trim(),
                    profile_picture: image_url || ''
                };

                const updatedUser = await User.findByIdAndUpdate(
                    id, 
                    updatedUserData,
                    { new: true }
                );

                if (!updatedUser) {
                    throw new Error('User not found for update');
                }

                console.log('User updated successfully:', updatedUser._id);
                return { success: true, userId: updatedUser._id };
            } catch (error) {
                console.error('Error in syncUserUpdation:', error);
                throw error;
            }
        }
    );

    // Inngest Function to delete user data from database
    const syncUserDeletion = inngest.createFunction(
        {id: 'delete-user-with-clerk'},
        {event: 'clerk/user.deleted'},
        async ({event}) => {
            try {
                await connectDB();
                
                const {id} = event.data;
                console.log('Deleting user:', id);

                const deletedUser = await User.findByIdAndDelete(id);

                if (!deletedUser) {
                    console.warn('User not found for deletion:', id);
                    return { success: false, message: 'User not found' };
                }

                console.log('User deleted successfully:', id);
                return { success: true, userId: id };
            } catch (error) {
                console.error('Error in syncUserDeletion:', error);
                throw error;
            }
        }
    );

    // Create an empty array where we'll export future Inngest functions
    export const functions = [
        syncUserCreation,
        syncUserUpdation,
        syncUserDeletion
    ]