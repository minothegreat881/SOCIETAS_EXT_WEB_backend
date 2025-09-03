export default {
  async upload(ctx) {
    try {
      const files = ctx.request.files;
      
      if (!files || !files.files) {
        return ctx.badRequest('No files uploaded');
      }

      console.log('🔥 RAW UPLOAD: Frontend cleaned EXIF, now uploading...');

      const uploadService = strapi.plugin('upload').service('upload');
      
      // Handle single file or array of files
      const filesList = Array.isArray(files.files) ? files.files : [files.files];
      
      const uploadedFiles = await uploadService.upload({
        data: {},
        files: filesList,
      });

      console.log('✅ Raw upload successful:', uploadedFiles.length, 'files (EXIF pre-cleaned on frontend)');
      return uploadedFiles;
    } catch (error) {
      console.error('❌ Raw upload error:', error);
      return ctx.badRequest('Upload failed: ' + error.message);
    }
  },
};