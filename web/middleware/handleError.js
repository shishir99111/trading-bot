const { requestlogsDAO } = rootRequire('commons/DAO')

module.exports = (app) => {
  // Error: 404
  app.use((req, res, next) => {
    const error = new Error('Invalid Endpoint')
    error.name = 'UnknownRoute'
    error.requestId = req.requestId
    error.status = 404
    next(error)
  })

  // eslint-disable-next-line
  app.use((err, req, res, next) => {
    const requestUpdateQuery = {
      $set: {
        error: {
          name: err.name,
          message: err.message,
          opts: err.opts,
        },
        status: err.status || 200,
      },
    }
    requestlogsDAO.findByIdAndUpdate(req.requestId, requestUpdateQuery)

    return res.status(err.status || 200).json({
      success: false,
      error: {
        name: err.name,
        message: err.message,
        errorResponse: err.payload,
      },
    })
  })
}