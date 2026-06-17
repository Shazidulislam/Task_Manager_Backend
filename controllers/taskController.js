import Task from "../model/taskModel";

// Create a new Task
export const createTask = async (req, res) => {
  try {
    if (dueDate && isNaN(new Date(dueDate))) {
      return res.status(400).json({ success: false, message: "Invalid due date" });
    }
    const { title, description, priority, dueDate, completed } = req.body;

    // Basic validation
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      completed,
      owner: req.user._id,
    });
    const saved = await task.save();
    res.status(201).json({
      success: true,
      task: saved,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get All Task for logged -In user 
export const getTask = async(req , res)=>{
    try{
        const task = await Task.find({owner:req.user._id}).sort({createdAt:-1});
        res.json({success:true , task});
    }
    catch(error){
         res.status(500).json({
            success:false,
            message:error.message
         });
    }
}