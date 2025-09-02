// DISABLED Sharp EXIF rotation - let Cloudinary handle orientation
export default {
  register({ strapi }) {
    console.log('📸 Upload plugin loaded - Sharp EXIF rotation DISABLED, letting Cloudinary handle orientation');
    // No overrides - use default Strapi upload behavior
  },
};