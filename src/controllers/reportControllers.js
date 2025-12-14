const reportModel = require('../models/Report')

//get all report 
async function getReport(req,res){
    try{
        const reports = await reportModel.find()
        if (!reports){
            return res.status(404).json("No report found")
        }
        return res.status(200).json(reports)
    } catch (err){
        return res.status(500).json({message: err.message})
    }

}

// create a report 
async function createReport(req,res){
    try {
        const report = await reportModel.create(req.body)
        if (!report){
            return res.status(404).json("Report not created")
        }
        return res.status(200).json(report)
    }catch (err){
        return res.status(500).json({message: err.message})
    }
}

// get a report by id
async function getReportById(req,res){
    try {
        const report = await reportModel.findById(req.params.id)
        if (!report){
            return res.status(404).json("Report not found")
        }
        return res.status(200).json(report)
    }catch (err){
        return res.status(500).json({message: err.message})
    }
}

module.exports = {
    getReport,
    createReport,
    getReportById
}