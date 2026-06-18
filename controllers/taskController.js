import Task from "../model/taskModel";

// Create a new Task || post 
export const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, completed } = req.body;


    if (dueDate && isNaN(new Date(dueDate))) {
      return res.status(400).json({ success: false, message: "Invalid due date" });
    }
    

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


// Get All Task for logged -In user  || get all
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

// Get single task bt ID (With logged user) || get
export const getTaskById = async(req ,res)=>{
  try{
    const task = await Task.findOne({
      _id:req.params.id , 
      owner:req.user._id
    })

    if(!task) return res.status(404).json({
      success:false,
      message:"Task not found"
    })
    res.json({
      success:true,
      task,
    })

  }
  catch(error){
         res.status(500).json({
            success:false,
            message:error.message
         });
    }
}

// Update a task || put
export const updateTask = async(req , res)=>{
      try{

        const data = {...req.body};
        if(data.completed != undefined){
          data.completed = data.completed = "Yes"|| data.completed == true;
        }

        const updated = await Task.findOneAndUpdate(
          {
            _id:req.params.id ,
            owner: req.user._id
          },
          data,
          {new:true ,
            runValidators:true
          }
        );
       if(!updated){
        return  res.status(404).json({
          success:false,
          message:"Task not found or not yours"
        })
       }

       res.json({
        success:true ,
        task:updated
       })

      }
      catch(error){
         res.status(500).json({
            success:false,
            message:error.message
         });
    }
}

// Delete  a task 
export const  deleteTask = async(req , res)=>{
     try{
      const deleted = await Task.findOneAndDelete({
        _id:req.params?.id ,
        owner:req.user?._id
      });
      if(!deleted) return res.status(404).json(
        {
          success:false,
          message:"Task not found or not yours"
        }
      );
      res.json({
        success:true,
        message:"Task deleted"
      })
     }
      catch(error){
         res.status(500).json({
            success:false,
            message:error.message
         });
    }
}