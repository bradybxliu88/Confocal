import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import { Project } from '../types';
import { toast } from 'react-toastify';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadProject(id);
  }, [id]);

  const loadProject = async (projectId: string) => {
    try {
      const response = await projectsAPI.getById(projectId);
      setProject(response.data.project);
    } catch (error) {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div></div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{project.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Progress</h3>
          <p className="text-3xl font-bold text-purple-600">{project.progress}%</p>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Budget Used</h3>
          <p className="text-3xl font-bold text-green-600">${project.budgetUsed.toLocaleString()}</p>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</h3>
          <p className="text-3xl font-bold text-blue-600 capitalize">{project.status}</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
