    // import { Inngest } from "inngest";
    // import User from "../models/User.js";

    // // Create a client to send and receive events
    // export const inngest = new Inngest({ id: "my-app" });

    // // Inngest Function to save user data to a database
    // const syncUserCreation = inngest.createFunction(
    //     {id : 'sync-user-from-clerk'},
    //     {event : 'clerk/user.created'},
    //     async ({event})=>{
    //         const{id, first_name, last_name, email_addresses, image_url} =event.data
    //         let username = email_addresses[0].email_address.split('@')[0]

    //         // Check availability of username
    //         const user = await User.findOne({username})

    //         if (user) {
    //             username = username + Math.floor(Math.random() * 10000)
    //         }

    //         const userData = {
    //             _id: id,
    //             email: email_addresses[0].email_address,
    //             full_name: first_name + ' ' + last_name,
    //             profile_picture: image_url,
    //             username
    //         }
    //         await User.create(userData)
    //     }
    // )

    // // Inngest Function to update user data to a database
    // const syncUserUpdation = inngest.createFunction(
    //     {id : 'update-user-from-clerk'},
    //     {event : 'clerk/user.updated'},
    //     async ({event})=>{
    //         const{id, first_name, last_name, email_addresses, image_url} =event.data

    //     const updatedUserData = {
    //         email: email_addresses[0].email_address,
    //         full_name: first_name + ' ' + last_name,
    //         profile_picture: image_url
    //     }
    //     await User.findByIdAndUpdate(id, updatedUserData)
    //     }
    // )

    // // Inngest Function to delete user data from database
    // const syncUserDeletion = inngest.createFunction(
    //     {id : 'delete-user-with-clerk'},
    //     {event : 'clerk/user.deleted'},
    //     async ({event})=>{
    //         const{id} =event.data
    //         await User.findByIdAndDelete(id)
    //     }
    // )

    // // Create an empty array where we'll export future Inngest functions
    // export const functions = [
    //     syncUserCreation,
    //     syncUserUpdation,
    //     syncUserDeletion
    // ]


import { Inngest } from "inngest";
import User from "../models/User.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "my-app" });

// Inngest Function to save user data to a database
const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
  },
  { event: "clerk/user.created" },
  async ({ event, step }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    
    let username = email_addresses[0].email_address.split("@")[0];

    // Check availability of username using step.run for better reliability
    const user = await step.run("check-username", async () => {
      return await User.findOne({ username });
    });

    if (user) {
      username = username + Math.floor(Math.random() * 10000);
    }

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      full_name: `${first_name} ${last_name}`,
      profile_picture: image_url,
      username,
    };

    await step.run("create-user", async () => {
      await User.create(userData);
    });

    return { message: "User created successfully", userId: id };
  }
);

// Inngest Function to update user data to a database
const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
  },
  { event: "clerk/user.updated" },
  async ({ event, step }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const updatedUserData = {
      email: email_addresses[0].email_address,
      full_name: `${first_name} ${last_name}`,
      profile_picture: image_url,
    };

    await step.run("update-user", async () => {
      await User.findByIdAndUpdate(id, updatedUserData);
    });

    return { message: "User updated successfully", userId: id };
  }
);

// Inngest Function to delete user data from database
const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-with-clerk",
  },
  { event: "clerk/user.deleted" },
  async ({ event, step }) => {
    const { id } = event.data;
    
    await step.run("delete-user", async () => {
      await User.findByIdAndDelete(id);
    });

    return { message: "User deleted successfully", userId: id };
  }
);

// Export all functions
export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
];