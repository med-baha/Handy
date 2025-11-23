import Post from "../models/Postes.js";

export const addNewPost = async (req, res) => {
    console.log(req.body)
    const { userid, post } = req.body
    console.log(userid, post)
    try {
        const newPost = await Post.create({
            poster: userid,
            content: post
        })
        return res.status(200).json(newPost)

    } catch (error) {
        return res.status(500).json(error)
    }
}

export const getPosts = async (req, res) => {

    try {
        // Populate the poster field to get user details
        const posts = await Post.find({}).populate('poster', 'name specialty profilepic');
        return res.status(200).json(posts)
    } catch (error) {
        return res.status(500).json(error)
    }
}