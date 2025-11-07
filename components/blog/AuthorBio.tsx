/**
 * Author Bio Component
 * Displays author information and credentials at the end of blog posts
 */

interface AuthorBioProps {
  authorName: string;
  authorRole?: string;
  authorBio?: string;
  authorImage?: string;
}

export default function AuthorBio({ 
  authorName,
  authorRole = 'Content Writer',
  authorBio,
  authorImage 
}: AuthorBioProps) {
  // Default bio if none provided
  const bio = authorBio || `${authorName} is a ${authorRole} at Automet, helping AMC businesses optimize their field service operations through insightful content and best practices.`;

  // Default avatar with initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Author Image/Avatar */}
        <div className="flex-shrink-0">
          {authorImage ? (
            <img
              src={authorImage}
              alt={authorName}
              className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold shadow-md">
              {getInitials(authorName)}
            </div>
          )}
        </div>

        {/* Author Info */}
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <h4 className="text-lg font-bold text-gray-900 mb-0.5">
              {authorName}
            </h4>
            <p className="text-sm text-gray-600 font-medium">
              {authorRole}
            </p>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            {bio}
          </p>

          {/* Social Links (Future Enhancement) */}
          <div className="flex items-center gap-3">
            <a
              href={`https://linkedin.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a
              href={`https://twitter.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-primary transition-colors"
              aria-label="Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

