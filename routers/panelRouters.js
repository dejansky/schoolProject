const express = require('express');
const db = require('../db');

const router = express.Router();

const MINIMUM_TEXT_LENGTH = 2;
const MINIMUM_NAME_LENGTH = 2;
const MINIMUM_POST_PER_PAGE = 1;


router.all('/*', function(request, response, next) {
    request.app.locals.layout = 'panel.hbs';
    next();
})

router.get("/", function(request, response) {

    response.redirect('/panel/panel-main');

})


router.get("/panel-main", function(request, response) {
    const id = "panel-main"
    const errors = []


    const titles = new Promise((resolve, reject) => {
        db.getSiteTitles(id, function(error, rows) {
            if (rows) {
                resolve(rows)
            } else {
                reject(error)
            }
        })
    })

    const site_settings = new Promise((resolve, reject) => {
        db.getGeneralSettings(function(error, rows) {
            if (rows) {
                resolve(rows)
            } else {
                reject(error)
            }
        })
    })

    Promise.all([titles, site_settings]).then((m) => {
        const model = {
            titles: m[0],
            site_settings: m[1],
            error: false
        }
        console.log(model)
        response.render("panel-main.hbs", model)
    }).catch((m) => {

        errors.push('Internal server error :( ')

        const model = {
            error: true,
            errors: errors,
        }
        console.log(m)
        response.render("panel-main.hbs", model)
    })

})

function validateGeneralSettingsInput(title, subtitle, post_per_page, profile_img_url, img_url, email, name, about) {
    const errors = []

    let reg = /\d+/

    if (title.length < MINIMUM_TEXT_LENGTH || subtitle < MINIMUM_TEXT_LENGTH) {
        errors.push('Title must be greater then ' + MINIMUM_TEXT_LENGTH + ' characters')
    }
    if (isNaN(parseInt(post_per_page))) {
        errors.push('Post per page must be a number')
    } else if (parseInt(post_per_page) < MINIMUM_POST_PER_PAGE) {
        errors.push('Post per page must be greater then ' + MINIMUM_POST_PER_PAGE + '!')
    }
    if (!img_url.includes('https://') && !img_url.includes('http://') && !img_url.includes('images/')) {
        errors.push('Invalid image url')
    }
    if (!profile_img_url.includes('https://') && !profile_img_url.includes('http://') && !profile_img_url.includes('images/')) {
        errors.push('Invalid profile image url')
    }
    if (!email.includes('@')) {
        errors.push('Invalid email')
    }
    if (name.length < MINIMUM_NAME_LENGTH) {
        errors.push('About must be greater then ' + MINIMUM_TEXT_LENGTH + '!')
    } else if (reg.test(name)) {
        errors.push('Name can not contain numbers!')
    }
    if (about.length < MINIMUM_TEXT_LENGTH) {
        errors.push('About must be greater then ' + MINIMUM_TEXT_LENGTH + '!')
    }

    return errors

}

router.post("/panel-main/update", function(request, response) {
    const id = "panel-main"

    const site_title = request.body.site_title
    const site_subtitle = request.body.site_subtitle
    const posts_per_page = request.body.posts_per_page
    const profile_img_url = request.body.profile_img_url
    const img_url = request.body.img_url
    const global_email = request.body.global_email
    const global_name = request.body.global_name
    const about = request.body.about

    console.log(site_title, site_subtitle, posts_per_page, profile_img_url, img_url, global_email, global_name, about)

    const errors = validateGeneralSettingsInput(site_title, site_subtitle, posts_per_page, profile_img_url, img_url, global_email, global_name, about)

    if (errors.length > 0) {
        db.getSiteTitles(id, function(error, rows) {
            if (error) {
                console.log(error)
                errors.push('Internal server error! Please try again later. ')
                const model = {
                    error: true,
                    errors: errors
                }
                console.log(model)
                response.render("panel-main.hbs", model)
            } else {
                const model = {
                    titles: rows,
                    errors: errors,
                    site_settings: [{
                        site_title: site_title,
                        site_subtitle: site_subtitle,
                        posts_per_page: posts_per_page,
                        img_url: img_url,
                        profile_img_url: profile_img_url,
                        global_email: global_email,
                        global_name: global_name,
                        about: about
                    }]
                }
                console.log(model)
                response.render("panel-main.hbs", model)
            }
        })
    } else {
        db.updateGeneralSettings(site_title, site_subtitle, posts_per_page, profile_img_url, img_url, global_email, global_name, about, function(error) {
            if (error) {
                console.log(error)
                errors.push('Internal server error! Please try again later. ')
                const model = {
                    error: true,
                    errors: errors
                }
                response.render("panel-main.hbs", model)

            } else {
                db.getSiteTitles(id, function(error, rows) {
                    if (error) {
                        console.log(error)
                        errors.push('Internal server error! Please try again later. ')
                        const model = {
                            error: true,
                            errors: errors
                        }
                        console.log(model)
                        response.render("panel-main.hbs", model)
                    } else {
                        const model = {
                            titles: rows,
                            success: true,
                            errors: errors,
                            site_settings: [{
                                site_title: site_title,
                                site_subtitle: site_subtitle,
                                posts_per_page: posts_per_page,
                                img_url: img_url,
                                profile_img_url: profile_img_url,
                                global_email: global_email,
                                global_name: global_name,
                                about: about
                            }]
                        }
                        console.log(model)
                        response.render("panel-main.hbs", model)
                    }
                })
            }
        })
    }

})


router.get("/panel-posts", function(request, response) {

    const id = "panel-posts"

    const errors = []

    const titles = new Promise((resolve, reject) => {
        db.getSiteTitles(id, function(error, rows) {
            if (rows) {
                resolve(rows)
            } else {
                reject(error)
            }
        })
    })

    const posts = new Promise((resolve, reject) => {
        db.getPosts(function(error, rows) {
            if (rows) {
                resolve(rows)
            } else {
                reject(error)
            }
        })
    })

    Promise.all([titles, posts]).then((m) => {
        const model = {
            titles: m[0],
            posts: m[1],
            error: false
        }
        console.log(model)
        response.render("panel-posts.hbs", model)

    }).catch((m) => {
        errors.push('Internal server error :(')
        const model = {
            error: true,
            errors: errors
        }
        console.log(m)
        response.render("panel-main.hbs", model)
    })
})

function validatePostInput(post_title, post_content) {
    const errors = []

    if (post_title.length < MINIMUM_TEXT_LENGTH) {
        errors.push("Title must consist of more than " + MINIMUM_TEXT_LENGTH + " characters! ")
    }
    if (post_content.length < MINIMUM_TEXT_LENGTH) {
        errors.push("Content must consist of more than " + MINIMUM_TEXT_LENGTH + " characters! ")
    }

    return errors

}

router.post("/panel-posts/create", function(request, response) {
    const id = "panel-posts"

    const create_post_title = request.body.create_post_title
    const create_post_content = request.body.create_post_content

    const errors = validatePostInput(create_post_title, create_post_content)

    if (errors.length > 0) {

        db.getSiteTitles(id, function(error, rows) {
            if (error) {
                errors.push('Internal server error! Please try again later. ')
                console.log(error)
                const model = {
                    error: true,
                    errors: errors
                }
                console.log(model)
                response.render("panel-posts.hbs", model)
            } else {
                db.getPosts(function(error, posts) {
                    const model = {
                        titles: rows,
                        errors: errors,
                        posts: posts,
                        create_posts: {
                            create_post_title: create_post_title,
                            create_post_content: create_post_content
                        }
                    }
                    console.log(model)
                    response.render("panel-posts.hbs", model)
                })

            }
        })
    } else {
        db.createPost(create_post_content, create_post_title, function(error) {
            if (error) {
                errors.push('Internal server error! Please try again later. ')
                console.log(error)
                const model = {
                    error: true,
                    errors: errors
                }
                console.log(model)
                response.render("panel-posts.hbs", model)
            } else {
                db.getSiteTitles(id, function(error, rows) {
                    if (error) {
                        errors.push('Internal server error! Please try again later. ')
                        console.log(error)
                        const model = {
                            error: true,
                            errors: errors
                        }
                        console.log(model)
                        response.render("panel-posts.hbs", model)
                    } else {
                        db.getPosts(function(error, posts) {
                            if (error) {
                                errors.push('Internal server error! Please try again later. ')
                                console.log(error)
                                const model = {
                                    error: true,
                                    errors: errors
                                }
                                console.log(model)
                                response.render("panel-posts.hbs", model)
                            } else {
                                const model = {
                                    titles: rows,
                                    errors: errors,
                                    success_created: true,
                                    posts: posts,
                                }
                                console.log(model)
                                response.render("panel-posts.hbs", model)
                            }
                        })
                    }
                })
            }
        })
    }


})

router.post("/panel-posts/update", function(request, response) {
    const id = "panel-posts"
    const post_title = request.body.post_title
    const post_content = request.body.post_content
    const p_id = request.body.post_id

    const errors = validatePostInput(post_title, post_content)

    if (errors.length > 0) {
        db.getSiteTitles(id, function(error, rows) {
            if (error) {
                errors.push('Internal server error! Please try again later. ')
                console.log(error)
                const model = {
                    error: true,
                    errors: errors
                }
                console.log(model)
                response.render("panel-posts.hbs", model)
            } else {
                const model = {
                    titles: rows,
                    errors: errors,
                    posts: [{
                        post_title: post_title,
                        post_content: post_content,
                        id: p_id
                    }]
                }
                console.log(model)
                response.render("panel-posts.hbs", model)
            }
        })
    } else {
        db.updatePost(post_title, post_content, p_id, function(error) {
            if (error) {
                errors.push('Internal server error! Please try again later. ')
                console.log(error)
                const model = {
                    error: true,
                    errors: errors
                }
                console.log(model)
                response.render("panel-posts.hbs", model)
            } else {
                db.getSiteTitles(id, function(error, rows) {
                    if (error) {
                        errors.push('Internal server error! Please try again later. ')
                        console.log(error)
                        const model = {
                            error: true,
                            errors: errors
                        }
                        console.log(model)
                        response.render("panel-posts.hbs", model)
                    } else {
                        db.getPosts(function(error, posts) {
                            if (error) {
                                errors.push('Internal server error! Please try again later. ')
                                console.log(error)
                                const model = {
                                    error: true,
                                    errors: errors
                                }
                                console.log(model)
                                response.render("panel-posts.hbs", model)
                            } else {
                                const model = {
                                    titles: rows,
                                    errors: errors,
                                    success_updated: true,
                                    posts: posts,
                                }
                                console.log(model)
                                response.render("panel-posts.hbs", model)
                            }

                        })
                    }
                })
            }
        })
    }


})

router.post("/panel-posts/delete", function(request, response) {
    const id = "panel-posts"
    const p_id = request.body.post_id
    errors = []

    db.deletePost(p_id, function(error) {
        if (error) {
            errors.push('Internal server error! Please try again later. ')
            console.log(error)
            const model = {
                error: true,
                errors: errors
            }
            console.log(model)
            response.render("panel-posts.hbs", model)
        } else {
            db.getSiteTitles(id, function(error, rows) {
                if (error) {
                    errors.push('Internal server error! Please try again later. ')
                    console.log(error)
                    const model = {
                        error: true,
                        errors: errors
                    }
                    console.log(model)
                    response.render("panel-posts.hbs", model)
                } else {
                    db.getPosts(function(error, posts) {
                        if (error) {
                            errors.push('Internal server error! Please try again later. ')
                            console.log(error)
                            const model = {
                                error: true,
                                errors: errors
                            }
                            console.log(model)
                            response.render("panel-posts.hbs", model)
                        } else {
                            const model = {
                                titles: rows,
                                errors: errors,
                                success_deleted: true,
                                posts: posts,
                            }
                            console.log(model)
                            response.render("panel-posts.hbs", model)
                        }

                    })
                }
            })
        }
    })
})

function validateProjectInput(title, project_thumbnail, project_link, post_content) {
    const errors = []
    if (title.length < MINIMUM_TEXT_LENGTH) {
        errors.push('Title must be greater then ' + MINIMUM_TEXT_LENGTH + ' characters')
    }
    if (!project_thumbnail.includes('https://') && !project_thumbnail.includes('http://') && !project_thumbnail.includes('images/')) {
        errors.push('Invalid thumbnail url')
    }
    if (!project_link.includes('https://') && !project_link.includes('http://')) {
        errors.push('Invalid project url')
    }
    if (post_content.length < MINIMUM_TEXT_LENGTH) {
        errors.push('Content must consist of at least ' + MINIMUM_TEXT_LENGTH + 'characters!')
    }

    return errors

}

router.post("/panel-projects/create", function(request, response) {
    const id = "panel-projects"
    const post_title = request.body.project_title
    const project_thumbnail = request.body.project_thumbnail
    const project_link = request.body.project_link
    const post_content = request.body.project_content

    const errors = validateProjectInput(post_title, project_thumbnail, project_link, post_content)

    if (errors.length > 0) {
        db.getSiteTitles(id, function(error, rows) {
            if (error) {
                errors.push('Internal server error! Please try again later. ')
                console.log(error)
                const model = {
                    error: true,
                    errors: errors
                }
                console.log(model)
                response.render("panel-projects.hbs", model)
            } else {
                const model = {
                    titles: rows,
                    errors: errors,
                    create_projects: {
                        create_post_title: post_title,
                        create_post_content: post_content,
                        create_project_link: project_link,
                        create_project_thumbnail: project_thumbnail,
                    }
                }
                console.log(model)
                response.render("panel-projects.hbs", model)
            }
        })
    } else {
        db.createProject(post_title, post_content, project_thumbnail, project_link, function(error) {
            if (error) {
                errors.push('Internal server error! Please try again later. ')
                console.log(error)
                const model = {
                    error: true,
                    errors: errors
                }
                console.log(model)
                response.render("panel-projects.hbs", model)
            } else {
                db.getSiteTitles(id, function(error, rows) {
                    if (error) {
                        errors.push('Internal server error! Please try again later. ')
                        console.log(error)
                        const model = {
                            error: true,
                            errors: errors
                        }
                        console.log(model)
                        response.render("panel-projects.hbs", model)
                    } else {
                        db.getProjects(function(error, projects) {
                            if (error) {
                                errors.push('Internal server error! Please try again later. ')
                                console.log(error)
                                const model = {
                                    error: true,
                                    errors: errors
                                }
                                console.log(model)
                                response.render("panel-projects.hbs", model)
                            } else {
                                const model = {
                                    titles: rows,
                                    errors: errors,
                                    success_created: true,
                                    projects: projects,
                                }
                                console.log(model)
                                response.render("panel-projects.hbs", model)
                            }

                        })
                    }
                })
            }
        })
    }


})


router.get("/panel-projects", function(request, response) {
    const id = "panel-projects"

    const titles = new Promise((resolve, reject) => {
        db.getSiteTitles(id, function(error, rows) {
            if (rows) {
                resolve(rows)
            } else {
                reject(error)
            }
        })
    })

    const projects = new Promise((resolve, reject) => {
        db.getProjects(function(error, rows) {
            if (rows) {
                resolve(rows)
            } else {
                reject(error)
            }
        })
    })

    Promise.all([titles, projects]).then((m) => {
        const model = {
            titles: m[0],
            projects: m[1],
            error: false
        }
        console.log(model)
        response.render("panel-projects.hbs", model)

    }).catch((m) => {
        const model = {
            error: true,
        }
        console.log(m)
        response.render("panel-main.hbs", model)
    })
})




router.post("/panel-projects/update", function(request, response) {
    id = "panel-projects"
    const post_title = request.body.project_title
    const project_thumbnail = request.body.project_thumbnail
    const project_link = request.body.project_link
    const post_content = request.body.project_content
    const p_id = request.body.post_id

    const errors = validateProjectInput(post_title, project_thumbnail, project_link, post_content)

    console.log(errors)

    if (errors.length > 0) {
        db.getSiteTitles(id, function(error, rows) {
            if (error) {
                errors.push('Internal server error! Please try again later. ')
                console.log(error)
                const model = {
                    error: true,
                    errors: errors
                }
                console.log(model)
                response.render("panel-projects.hbs", model)
            } else {
                const model = {
                    titles: rows,
                    errors: errors,
                    projects: [{
                        post_title: post_title,
                        post_content: post_content,
                        project_link: project_link,
                        project_thumbnail: project_thumbnail,
                        id: p_id
                    }]
                }
                console.log(model)
                response.render("panel-projects.hbs", model)
            }
        })
    } else {
        db.updateProject(p_id, post_title, post_content, project_thumbnail, project_link, function(error) {
            if (error) {
                errors.push('Internal server error! Please try again later. ')
                console.log(error)
                const model = {
                    error: true,
                    errors: errors
                }
                console.log(model)
                response.render("panel-projects.hbs", model)
            } else {
                db.getSiteTitles(id, function(error, rows) {
                    if (error) {
                        errors.push('Internal server error! Please try again later. ')
                        console.log(error)
                        const model = {
                            error: true,
                            errors: errors
                        }
                        console.log(model)
                        response.render("panel-projects.hbs", model)
                    } else {
                        db.getProjects(function(error, projects) {
                            if (error) {
                                errors.push('Internal server error! Please try again later. ')
                                console.log(error)
                                const model = {
                                    error: true,
                                    errors: errors
                                }
                                console.log(model)
                                response.render("panel-projects.hbs", model)
                            } else {
                                const model = {
                                    titles: rows,
                                    errors: errors,
                                    success_updated: true,
                                    projects: projects,
                                }
                                console.log(model)
                                response.render("panel-projects.hbs", model)
                            }

                        })
                    }
                })
            }
        })
    }

})

router.post("/panel-projects/delete", function(request, response) {
    const id = "panel-projects"
    const the_id = request.body.post_id

    const errors = []

    db.deleteProject(the_id, function(error) {
        if (error) {
            errors.push('Internal server error! Please try again later. ')
            console.log(error)
            const model = {
                error: true,
                errors: errors
            }
            console.log(model)
            response.render("panel-projects.hbs", model)
        } else {
            db.getSiteTitles(id, function(error, rows) {
                if (error) {
                    errors.push('Internal server error! Please try again later. ')
                    console.log(error)
                    const model = {
                        error: true,
                        errors: errors
                    }
                    console.log(model)
                    response.render("panel-projects.hbs", model)
                } else {
                    db.getProjects(function(error, projects) {
                        if (error) {
                            errors.push('Internal server error! Please try again later. ')
                            console.log(error)
                            const model = {
                                error: true,
                                errors: errors
                            }
                            console.log(model)
                            response.render("panel-projects.hbs", model)
                        } else {
                            const model = {
                                titles: rows,
                                errors: errors,
                                success_deleted: true,
                                projects: projects,
                            }
                            console.log(model)
                            response.render("panel-projects.hbs", model)
                        }

                    })
                }
            })
        }
    })
})




router.get("/panel-messages", function(request, response) {

    const id = "panel-messages"
    const titles = new Promise((resolve, reject) => {
        db.getSiteTitles(id, function(error, rows) {
            if (rows) {
                resolve(rows)
            } else {
                reject(error)
            }
        })
    })

    const guest_messages = new Promise((resolve, reject) => {
        db.getMessages(function(error, rows) {
            if (rows) {
                resolve(rows)
            } else {
                reject(error)
            }
        })
    })

    Promise.all([titles, guest_messages]).then((m) => {
        const model = {
            titles: m[0],
            guest_messages: m[1],
            error: false
        }
        console.log(model)
        response.render("panel-messages.hbs", model)

    }).catch((m) => {
        const model = {
            error: true,
        }
        console.log(m)
        response.render("panel-main.hbs", model)
    })


})

router.post("/panel-messages", function(request, response) {

    const message_id = request.body.message_id

    db.deleteMessage(message_id, function(error) {
        if (error) {
            console.log(error)
        } else {
            console.log("sucess")
            response.redirect("/panel/")
        }
    })

})



module.exports = router;