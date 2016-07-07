/*global React*/
/*global ReactDOM*/
/*global Remarkable*/
/*global $*/

var PostContainer = React.createClass({
    loadPostsFromServer: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    handlePostSubmit: function(post) {
        var posts = this.state.data;
        // THIS WILL BE REPLACED BY MONGODB MAGIC
        post.id = Date.now();
        var newPosts = posts.concat([post]);
        this.setState({data: newPosts});
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: post,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                this.setState({data: posts});
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        this.loadPostsFromServer();
        setInterval(this.loadPostsFromServer, this.props.pollInterval);
    },
    render: function() {
        return (
            <div className="postContainer">
                <h1 className="blog-title">post what's on your mind</h1>
                <PostForm onPostSubmit={this.handlePostSubmit} />
                <h1 className="blog-title">latest and greatest posts</h1>
                <PostList data={this.state.data} />
            </div>
        );
    }
});

var PostList = React.createClass({
    render: function() {
        var postNodes = this.props.data.map(function(post) {
            return (
                <Post title={post.title} author={post.author} key={post.id}>
                    {post.text}
                </Post>
            );
        });
        return (
            <div className="postList">
                {postNodes}
            </div>
        );
    }
});

var Post = React.createClass({
    getMarkup: function() {
        var md = new Remarkable();
        var markup = md.render(this.props.children.toString());
        return { __html: markup };
    },
    render: function() {
        return (
            <div className="blogPost">
                <h2 className="postTitle">
                    {this.props.title}
                </h2>
                <div className="postAuthor">
                    by {this.props.author}
                </div>
                <span className="postContent" dangerouslySetInnerHTML={this.getMarkup()} />
            </div>
        );
    }
});

var PostForm = React.createClass({
    getInitialState: function() {
        return {title: '', author: '', text: ''};
    },
    handleTitleChange: function(e) {
        this.setState({title: e.target.value});
    },
    handleAuthorChange: function(e) {
        this.setState({author: e.target.value});
    },
    handleTextChange: function(e) {
        this.setState({text: e.target.value});
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var title = this.state.title.trim();
        var author = this.state.author.trim();
        var text = this.state.text;
        if (!title || !author || !text) {
            return;
        }
        this.props.onPostSubmit({title: title, author: author, text: text});
        this.setState({title: '', author: '', text: ''});
    },
    render: function() {
        return (
            <form className="postForm" onSubmit={this.handleSubmit}>
                <input
                    type="text"
                    placeholder="Post title"
                    value={this.state.title}
                    onChange={this.handleTitleChange}
                />
                <input
                    type="text"
                    placeholder="Your name"
                    value={this.state.author}
                    onChange={this.handleAuthorChange}
                />
                <input
                    type="text"
                    placeholder="Write post..."
                    value={this.state.text}
                    onChange={this.handleTextChange}
                />
                <input type="submit" value="Post" />
            </form>
        );
    }
});

ReactDOM.render(
    <PostContainer url="/api/posts" pollInterval={2000} />,
    document.getElementById('content')
);