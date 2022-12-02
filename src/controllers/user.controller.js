const e = require('express');
const User = require('../schema/user.schema');

module.exports.getUsersWithPostCount = async (req, res) => {
    try {
        //TODO: Implement this API
        var { page, limit } = req.query
        var totalPages, nextPage
        var hasNextPage = false
        var hasPrevPage = false
        var prevPage = null
        var pagingCounter = page
        var nextPage
        let query = [
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'userPosts'
                }
            },
            { $unwind: '$userPosts' },

            {
                $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    posts: { $sum: 1 }
                }
            },

        ]


        if (page && limit) {

            query.push(
                {
                    $skip: (page - 1) * limit
                },
                {
                    $limit: limit
                }
            )
            const users = await User.aggregate(query)

            if (limit >= users.length) {
                totalPages = 1
                prevPage = null
            } else {
                totalPages = Math.ceil(users.length / limit)
                if (page * limit < data.length) {
                    hasNextPage = true
                    nextPage = page++
                } else {
                    hasNextPage = false
                    nextPage = null
                }

                if ((page - 1) * limit > 0) {
                    prevPage = page - 1
                    hasPrevPage = true
                } else {
                    hasPrevPage = false
                }
            }
            return res.status(200).json({
                data: {
                    users: users, pagination: {
                        totalDocs: users.length,
                        limit: limit,
                        page: page,
                        totalPages: totalPages,
                        pagingCounter: pagingCounter,
                        hasPrevPage: hasPrevPage,
                        hasNextPage: hasNextPage,
                        prevPage: prevPage,
                        nextPage: nextPage
                    }
                }
            })
        } else {
            const users = await User.aggregate(query)
            return res.status(200).json({
                data: { users: users }
            })
        }

    } catch (error) {
        res.send({ error: error.message });
    }
}