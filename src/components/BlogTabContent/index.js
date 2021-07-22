import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withPrefix } from 'gatsby';
import { Box, Button } from 'grommet';
import { FormDown } from 'grommet-icons';
import { BlogCard } from '../BlogCard';
import ResponsiveGrid from '../ResponsiveGrid';
import { useLocalStorage } from '../../hooks/use-local-storage';

const BlogTabContent = ({ initialPage, columns, activeTab }) => {
  const [latestPage, setLatestPage] = useState(initialPage);
  const [blogPosts, setBlogPosts] = useState(initialPage.nodes);
  const [collectionId, setCollectionId] = useState(initialPage.collection.id);
  // eslint-disable-next-line no-unused-vars
  const [activeBlogTab, setActiveBlogTab] = useLocalStorage('activeBlogTab');
  const [loadMoreBlogData, setLoadMoreBlogData] = useLocalStorage(
    'loadMoreBlogData',
  );

  useEffect(() => {
    setCollectionId(initialPage.collection.id);

    // persist active tab for when user goes back to blog page
    // localStorage.setItem('blogTab', JSON.stringify(activeTab));
    setActiveBlogTab(activeTab);

    // loads blogs from user clicks 'Load More'
    // for when user goes back to blog page
    if (
      loadMoreBlogData &&
      loadMoreBlogData.latestPage &&
      loadMoreBlogData.latestBlogPosts &&
      loadMoreBlogData.collectionId === collectionId
    ) {
      setLatestPage(loadMoreBlogData.latestPage);
      setBlogPosts(loadMoreBlogData.latestBlogPosts);
    }
  }, [
    initialPage,
    setActiveBlogTab,
    activeTab,
    collectionId,
    loadMoreBlogData,
  ]);

  const loadNextPage = useCallback(async () => {
    if (!latestPage.hasNextPage) return;
    const nextPageId = latestPage.nextPage.id;
    const path = withPrefix(
      `/paginated-data/${collectionId}/${nextPageId}.json`,
    );
    const res = await fetch(path);
    const json = await res.json();
    setBlogPosts((state) => [...state, ...json.nodes]);
    setLatestPage(json);

    setLoadMoreBlogData({
      latestBlogPosts: [...blogPosts, ...json.nodes],
      latestPage: json,
      collectionId,
    });
  }, [latestPage, collectionId, blogPosts, setLoadMoreBlogData]);

  return (
    <>
      <ResponsiveGrid rows={{}} columns={columns}>
        {blogPosts.map(
          (blogPost) =>
            blogPost.url !== '/' && (
              <BlogCard key={blogPost.id} node={blogPost} />
            ),
        )}
      </ResponsiveGrid>
      <Box align="center" pad="medium">
        <Button
          icon={<FormDown />}
          hoverIndicator
          reverse
          onClick={loadNextPage}
          label="Load More"
        />
      </Box>
    </>
  );
};

BlogTabContent.propTypes = {
  initialPage: PropTypes.shape({
    nodes: PropTypes.arrayOf(
      PropTypes.shape({
        node: PropTypes.shape({
          title: PropTypes.string.isRequired,
          author: PropTypes.string.isRequired,
          date: PropTypes.string,
          description: PropTypes.string,
          authorimage: PropTypes.string,
        }),
      }).isRequired,
    ).isRequired,
    hasNextPage: PropTypes.bool.isRequired,
    nextPage: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
    collection: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
  }).isRequired,
  columns: PropTypes.shape({
    small: PropTypes.string,
    medium: PropTypes.arrayOf(PropTypes.string),
    large: PropTypes.arrayOf(PropTypes.string),
    xlarge: PropTypes.arrayOf(PropTypes.string),
  }),
  activeTab: PropTypes.number,
};

export default BlogTabContent;