import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFeed, createPost, reactToPost, addComment } from '../app/slices/postSlice';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import { Loader } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';

export default function SocialFeed() {
  const dispatch = useDispatch();
  const { posts, total, page, hasMore, loading } = useSelector(s => s.posts);
  const [pageNum, setPageNum] = useState(1);

  useEffect(() => {
    dispatch(getFeed({ page: 1 }));
  }, [dispatch]);

  const loadMore = () => {
    const nextPage = pageNum + 1;
    setPageNum(nextPage);
    dispatch(getFeed({ page: nextPage, append: true }));
  };

  const handlePostCreated = (newPost) => {
    // Handle post creation
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader className="spin" size={32} />
      </div>
    );
  }

  return (
    <div className="social-feed pt-8 lg:pt-10 pb-10 px-4">
      <CreatePost onPostCreated={handlePostCreated} />
      
      <InfiniteScroll
        dataLength={posts.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<div className="flex justify-center py-4"><Loader className="spin" size={24} /></div>}
        endMessage={
          <p className="text-center text-muted py-4">
            No more posts to load
          </p>
        }
      >
        <div className="posts-container">
          {posts.map(post => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </InfiniteScroll>

      <style>{`
        .social-feed {
          max-width: 680px;
          margin: 0 auto;
        }
        .posts-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
      `}</style>
    </div>
  );
}