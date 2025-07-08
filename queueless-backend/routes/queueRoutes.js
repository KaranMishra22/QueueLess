const express = require('express');
const Token = require('../models/Token');

const createRoutes = (io) => {
  const router = express.Router();

  // 🔄 Join Queue API
  router.post('/join', async (req, res) => {
    const { userName, serviceId, location } = req.body;

    // Store-specific hardcoded location (can move to DB later)
    const storeLocation = {
      salon123: { lat: 10.3456, lng: 77.8912 }
    };

    function isNearStore(userLoc, storeLoc, thresholdMeters = 200) {
      if (!userLoc || !storeLoc) return false;

      const toRad = deg => deg * Math.PI / 180;
      const R = 6371e3;

      const φ1 = toRad(userLoc.lat);
      const φ2 = toRad(storeLoc.lat);
      const Δφ = toRad(storeLoc.lat - userLoc.lat);
      const Δλ = toRad(storeLoc.lng - userLoc.lng);

      const a = Math.sin(Δφ / 2) ** 2 +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const distance = R * c;
      return distance <= thresholdMeters;
    }

    try {
      const lastToken = await Token.find({ serviceId }).sort({ tokenNumber: -1 }).limit(1);
      const nextTokenNumber = lastToken.length > 0 ? lastToken[0].tokenNumber + 1 : 1;

      const storeLoc = storeLocation[serviceId];
      const isOnSite = isNearStore(location, storeLoc);

      const isFirst = nextTokenNumber === 1;

      const newToken = new Token({
        userName,
        serviceId,
        tokenNumber: nextTokenNumber,
        location,
        isOnSite,
        isCurrent: isFirst
      });

      await newToken.save();

      const tokens = await Token.find({ serviceId }).sort({ tokenNumber: 1 });
      io.emit(`queueUpdate-${serviceId}`, tokens);

      res.json(newToken);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error joining queue' });
    }
  });

  // 📊 Get Queue Status
  router.get('/status/:serviceId', async (req, res) => {
  const tokens = await Token.find({
    serviceId: req.params.serviceId,
    status: { $in: ['waiting', 'arrived'] }
  }).sort({ tokenNumber: 1 });
  res.json(tokens);
});


  // 🔁 Update Token Status + Auto-Promote Next
  router.patch('/update/:tokenId', async (req, res) => {
    const { status } = req.body;

    try {
      const currentToken = await Token.findById(req.params.tokenId);
      if (!currentToken) return res.status(404).json({ message: 'Token not found' });

      currentToken.status = status;
      currentToken.isCurrent = false;
      await currentToken.save();

      // Find next waiting token and promote it
      const nextToken = await Token.findOne({
        serviceId: currentToken.serviceId,
        status: 'waiting'
      }).sort({ tokenNumber: 1 });

      if (nextToken) {
        nextToken.isCurrent = true;
        await nextToken.save();
      }

      const tokens = await Token.find({ serviceId: currentToken.serviceId }).sort({ tokenNumber: 1 });
      io.emit(`queueUpdate-${currentToken.serviceId}`, tokens);

      res.json({ current: currentToken, next: nextToken || null });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error updating token' });
    }
  });

  return router;
};

module.exports = createRoutes;
