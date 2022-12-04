const e = require('express');
const User = require('../schema/user.schema')

module.exports.getUsersWithPostCount = async (req, res) => {
    try {
        //TODO: Implement this API
        var { page, limit } = req.query
        limit = parseInt(limit)
        page = parseInt(page)
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
        const users = await User.aggregate(query)

        if (!(page && limit)) {
            return res.status(200).json({
                data: { users: users }
            })
        } else {
            const totalDocs = users.length
            var pagingCounter,totalPages,nextPage
            var hasPrevPage =false
            var hasNextPage = false
            var prevPage = null
            query.push(
                
                {
                    $skip: (page - 1) * limit
                },
                {
                    $limit: limit
                },
            )
            
            const Pusers = await User.aggregate(query)
            console.log('users',Pusers)
            pagingCounter=page
            if (limit >= users.length) {
                totalPages = 1
                prevPage = null
            } else {
                totalPages = Math.ceil(users.length / limit)
                if (page * limit < users.length) {
                    hasNextPage = true
                    nextPage = page+1
                } else {
                    hasNextPage = false
                    nextPage = null
                }

                if ((page - 1) * limit > 1) {
                    prevPage = page - 1
                    hasPrevPage = true
                } else {
                    hasPrevPage = false
                }
            }
            return res.status(200).json({
                data: {
                    users: Pusers, pagination: {
                        totalDocs:totalDocs,
                        limit:limit,
                        page:page,
                        totalPages:totalPages,
                        pagingCounter:pagingCounter,
                        hasPrevPage:hasPrevPage,
                        hasNextPage:hasNextPage,
                        prevPage:prevPage,
                        nextPage:nextPage
                    }
                }
            })

        }

    } catch (error) {
        res.send({ error: error.message });
    }
}




    //
           