import express from 'express';
import Listing from '../model/Listing.js';
import User from '../model/model.js';
import isAuthenticated from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new listing
router.post('/create', isAuthenticated, async (req, res) => {
  try {
    const { commodity, variety, quantity, unit, expectedPrice, description, location } = req.body;

    // Validation
    if (!commodity || !quantity || !expectedPrice || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: commodity, quantity, expectedPrice, location'
      });
    }

    const newListing = new Listing({
      farmerId: req.userID,
      commodity,
      variety: variety || '',
      quantity: parseFloat(quantity),
      unit: unit || 'kg',
      expectedPrice: parseFloat(expectedPrice),
      description: description || '',
      location
    });

    await newListing.save();

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      listing: newListing
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating listing',
      error: error.message
    });
  }
});

// Get all listings for authenticated farmer
router.get('/my-listings', isAuthenticated, async (req, res) => {
  try {
    const listings = await Listing.find({ farmerId: req.userID }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      listings: listings,
      count: listings.length
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching listings',
      error: error.message
    });
  }
});

// Get all listings (public)
router.get('/all', async (req, res) => {
  try {
    const listings = await Listing.find().populate('farmerId', 'Username email').sort({ createdAt: -1 });
    
    console.log('Fetched listings:', JSON.stringify(listings, null, 2));

    res.status(200).json({
      success: true,
      listings: listings,
      count: listings.length
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching listings',
      error: error.message
    });
  }
});

// TEMP: Clear corrupted listings
router.delete('/admin/clear-all', async (req, res) => {
  try {
    const result = await Listing.deleteMany({});
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} listings`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing listings',
      error: error.message
    });
  }
});

// Get listing by ID
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('farmerId', 'Username email');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    res.status(200).json({
      success: true,
      listing: listing
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching listing',
      error: error.message
    });
  }
});

// Update listing
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if user owns the listing
    if (listing.farmerId.toString() !== req.userID.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this listing'
      });
    }

    const { commodity, variety, quantity, unit, expectedPrice, description, location } = req.body;

    if (commodity) listing.commodity = commodity;
    if (variety !== undefined) listing.variety = variety;
    if (quantity) listing.quantity = parseFloat(quantity);
    if (unit) listing.unit = unit;
    if (expectedPrice) listing.expectedPrice = parseFloat(expectedPrice);
    if (description !== undefined) listing.description = description;
    if (location) listing.location = location;
    
    listing.updatedAt = new Date();

    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      listing: listing
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating listing',
      error: error.message
    });
  }
});

// Delete listing
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    // Check if user owns the listing
    if (listing.farmerId.toString() !== req.userID.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing'
      });
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting listing',
      error: error.message
    });
  }
});

export default router;
