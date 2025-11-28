// import ImageKit from '@imagekit/nodejs';

// const client = new ImageKit({
//   privateKey: process.env['IMAGEKIT_PRIVATE_KEY'], // This is the default and can be omitted
// });

// const response = await client.files.upload({
//   file: fs.createReadStream('path/to/file'),
//   fileName: 'file-name.jpg',
// });

// console.log(response);

// import Imagekit from "imagekit";

// var imagekit = new Imagekit({
//     publickey : process.env.IMAGEKIT_PUBLIC_KEY,
//     privatekey : process.env.IMAGEKIT_PRIVATE_KEY,
//     urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT
// });

// export default imagekit

import ImageKit from 'imagekit';

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

export default imagekit;