const asyncHandler = (responseHandler) => {(req, res, next) => {
  return Promise.resolve(responseHandler(req, res, next)).catch((err) => {console.log('Database Connection Failed! ', err)})
}}

export { asyncHandler };


//method 2 using try/catch syntax:

// const asyncHandler = (responseHandler) => async (req, res, next) => {
//   try {
//     await responseHandler(req, res, next)
//   } catch (error) {
//     console.log("Database Connection Failed! ",error)
//   }
// }