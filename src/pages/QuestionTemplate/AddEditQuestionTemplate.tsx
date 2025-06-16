// src/pages/AddEditQuestionTemplate.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import QuestionTemplateForm from "../../components/QuestionTempateForm";
import { apiFetch } from "../../libs/api";
import { QuestionTemplateData } from "../../types/question";

export default function AddEditQuestionTemplate() {
  const { templateId } = useParams();
  const isEdit = !!templateId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data } = useQuery<QuestionTemplateData>({
    queryKey: ["getQuestionTemplateById", templateId],
    queryFn: () => apiFetch("questionTemplate/" + templateId),
    enabled: isEdit,
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        {isEdit ? "Edit Question Template" : "Add Question Template"}
      </h2>
      <QuestionTemplateForm
        templateId={templateId}
        templateData={data}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["questionTemplateList"] });
          navigate("/question/template-list");
        }}
      />
    </div>
  );
}
