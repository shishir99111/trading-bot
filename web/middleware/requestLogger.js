const { requestlogsDAO } = rootRequire('commons/DAO');

function requestLog(req, res, next) {
  // client-id check
  if (!req.get('X-CLIENT-ID')) {
    const error = new Error('X-CLIENT-ID header is required');
    error.name = 'ClientIdMissing';
    next(error);
  }

  const log = {
    type: 'success',
    clientId: req.get('X-CLIENT-ID'),
    request: {
      method: req.method,
      path: req.path,
      body: req.body,
      xml: '',
    },
    status: 0,
  };

  // appending logObject in request
  req.logObject = log;

  return requestlogsDAO.save(log).then((result) => {
    req.requestId = result.id;
    next();
  }).catch((err) => {
    next(err);
  });
}

module.exports = requestLog;